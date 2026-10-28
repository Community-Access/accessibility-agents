package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/Community-Access/accessibility-agents/go-cli/internal/app"
	"github.com/Community-Access/accessibility-agents/go-cli/internal/config"
	"github.com/Community-Access/accessibility-agents/go-cli/internal/hooks"
	"github.com/Community-Access/accessibility-agents/go-cli/internal/manifest"
	"github.com/Community-Access/accessibility-agents/go-cli/internal/repo"
	"github.com/Community-Access/accessibility-agents/go-cli/internal/system"
)

func main() {
	autoRepair := flag.Bool("auto-repair", false, "fix known issues without prompting")
	fix := flag.String("fix", "all", "repair area: all, manifests, config, hooks, mcp")
	flag.Parse()

	workingDir, err := os.Getwd()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	repoRoot, _ := repo.FindRoot(workingDir)
	target := strings.ToLower(strings.TrimSpace(*fix))
	summary := []string{app.Prefix("ok", "Requested repair target: "+target)}
	if *autoRepair {
		summary = append(summary, app.Prefix("ok", "Automatic repair mode enabled"))
	}
	include := func(name string) bool {
		return target == "all" || target == name
	}
	failed := false

	if include("config") {
		scope := "project"
		if repoRoot == "" {
			scope = "global"
		}
		configPath, err := config.Path(scope, workingDir, repoRoot)
		if err != nil {
			summary = append(summary, app.Prefix("fail", err.Error()))
			failed = true
		} else if _, err := os.Stat(configPath); err == nil {
			summary = append(summary, app.Prefix("ok", "Config already present: "+configPath))
		} else {
			cfg := config.InstallConfig{Role: "developer", Scope: scope, Platforms: system.DetectPlatforms(), GitHooks: false, RepoRoot: repoRoot, MCPPort: 8080}
			if err := config.Save(configPath, cfg); err != nil {
				summary = append(summary, app.Prefix("fail", "Config repair failed: "+err.Error()))
				failed = true
			} else {
				summary = append(summary, app.Prefix("ok", "Config recreated at "+configPath))
			}
		}
	}

	if include("manifests") {
		if repoRoot == "" {
			summary = append(summary, app.Prefix("fail", "Cannot regenerate manifest outside a git repository"))
			failed = true
		} else if manifestPath, count, err := manifest.Write(repoRoot); err != nil {
			summary = append(summary, app.Prefix("fail", "Manifest generation failed: "+err.Error()))
			failed = true
		} else {
			summary = append(summary, app.Prefix("ok", fmt.Sprintf("Manifest regenerated with %d entries at %s", count, manifestPath)))
		}
	}

	if include("hooks") {
		if repoRoot == "" {
			summary = append(summary, app.Prefix("fail", "Cannot repair hooks outside a git repository"))
			failed = true
		} else if _, err := hooks.Install(repoRoot); err != nil {
			summary = append(summary, app.Prefix("fail", "Hook repair failed: "+err.Error()))
			failed = true
		} else {
			summary = append(summary, app.Prefix("ok", "Repository pre-commit hook installed or refreshed"))
		}
	}

	if include("mcp") {
		if repoRoot == "" {
			summary = append(summary, app.Prefix("fail", "Cannot repair MCP dependencies outside a git repository"))
			failed = true
		} else {
			mcpDir := filepath.Join(repoRoot, "mcp-server")
			if !system.FileExists(filepath.Join(mcpDir, "package.json")) {
				summary = append(summary, app.Prefix("warn", "MCP package.json not found; skipping MCP repair"))
			} else if !*autoRepair {
				summary = append(summary, app.Prefix("warn", "MCP repair requires --auto-repair to run npm install"))
			} else if !system.CheckCommand("npm", false, "--version").Available {
				summary = append(summary, app.Prefix("fail", "npm is required for MCP repair"))
				failed = true
			} else if err := system.RunCommand(mcpDir, "npm", "install"); err != nil {
				summary = append(summary, app.Prefix("fail", "npm install failed: "+err.Error()))
				failed = true
			} else {
				summary = append(summary, app.Prefix("ok", "MCP dependencies installed or refreshed"))
			}
		}
	}

	app.PrintResult(app.Result{Name: "Repair", Summary: summary})
	if failed {
		os.Exit(1)
	}
}
