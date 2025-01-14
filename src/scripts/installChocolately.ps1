# Set directory for installation - Chocolatey does not lock
# down the directory if not the default
$InstallDir='C:\\ProgramData\\chocoportable'
$env:ChocolateyInstall="$InstallDir"


# If your PowerShell Execution policy is restrictive, you may
# not be able to get around that. Try setting your session to
# Bypass.
Set-ExecutionPolicy Bypass -Scope Process -Force;

# All install options - offline, proxy, etc at
# https://chocolatey.org/install
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Optionally, you can verify the installation by checking the Chocolatey version
# choco --version