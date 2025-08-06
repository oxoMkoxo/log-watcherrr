# add-logs.ps1
1..1000 | ForEach-Object {
    "[LOG] $(Get-Date)" >> .\src\log.txt
    Start-Sleep -Seconds 2
}
