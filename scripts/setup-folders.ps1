$ErrorActionPreference = "Stop"
$backendSrc = "y:\LMStory - Main\apps\backend\src"
$frontendSrc = "y:\LMStory - Main\apps\frontend\src"

Write-Host "Creating Backend Structure..."
$backendDirs = @(
    "config", "database\prisma", "database\seed", "modules", "middlewares",
    "routes", "shared\errors", "shared\logger", "shared\helpers", "shared\responses",
    "jobs", "events", "socket", "utils", "types", "constants", "validators", "tests"
)

foreach ($dir in $backendDirs) {
    $null = New-Item -Path "$backendSrc\$dir" -ItemType Directory -Force
}

$null = New-Item -Path "$backendSrc\app.ts" -ItemType File -Force
$null = New-Item -Path "$backendSrc\server.ts" -ItemType File -Force
$null = New-Item -Path "$backendSrc\config\env.ts" -ItemType File -Force
$null = New-Item -Path "$backendSrc\config\database.ts" -ItemType File -Force
$null = New-Item -Path "$backendSrc\config\redis.ts" -ItemType File -Force
$null = New-Item -Path "$backendSrc\config\jwt.ts" -ItemType File -Force
$null = New-Item -Path "$backendSrc\config\storage.ts" -ItemType File -Force

$backendModules = @("auth", "tenant", "users", "roles", "groups", "library", "course", "campaign", "enrollment", "learner", "reports", "notification", "billing", "analytics")
$backendModuleSubdirs = @("controller", "service", "repository", "routes", "dto", "validation", "middleware", "interfaces", "constants", "types", "utils")

foreach ($mod in $backendModules) {
    foreach ($sub in $backendModuleSubdirs) {
        $null = New-Item -Path "$backendSrc\modules\$mod\$sub" -ItemType Directory -Force
    }
    $null = New-Item -Path "$backendSrc\modules\$mod\index.ts" -ItemType File -Force
}

Write-Host "Creating Frontend Structure..."
Remove-Item -Path "$frontendSrc\App.css" -ErrorAction SilentlyContinue
Remove-Item -Path "$frontendSrc\index.css" -ErrorAction SilentlyContinue
Remove-Item -Path "$frontendSrc\assets\react.svg" -ErrorAction SilentlyContinue

$frontendDirs = @("app", "assets", "components", "config", "constants", "contexts", "hooks", "layouts", "lib", "modules", "providers", "routes", "services", "store", "styles", "types", "utils")

foreach ($dir in $frontendDirs) {
    $null = New-Item -Path "$frontendSrc\$dir" -ItemType Directory -Force
}

$frontendModules = @("auth", "dashboard", "tenant", "users", "groups", "library", "course", "campaign", "enrollment", "learner", "reports", "notification", "settings")
$frontendModuleSubdirs = @("components", "pages", "hooks", "services", "schemas", "types", "utils")

foreach ($mod in $frontendModules) {
    foreach ($sub in $frontendModuleSubdirs) {
        $null = New-Item -Path "$frontendSrc\modules\$mod\$sub" -ItemType Directory -Force
    }
}

Write-Host "Done!"
