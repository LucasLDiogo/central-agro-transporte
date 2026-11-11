# Publica o painel no GitHub (repositorio + GitHub Pages). Uso: .\publicar.ps1 "mensagem do commit"
param([string]$Mensagem = "Atualiza o painel")
$ErrorActionPreference = 'Stop'
$dono = 'LucasLDiogo'; $repo = 'central-agro-transporte'
Set-Location $PSScriptRoot

# credencial ja guardada pelo Git nesta maquina (nao e exibida nem gravada em arquivo)
$cred = "protocol=https`nhost=github.com`n`n" | git credential fill
$token = (($cred | Select-String '^password=').Line) -replace '^password=', ''
if (-not $token) { throw 'Sem credencial do GitHub guardada no Git.' }
$h = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'central-agro-transporte'; 'X-GitHub-Api-Version' = '2022-11-28' }
function Api($metodo, $caminho, $corpo) {
  $p = @{ Method = $metodo; Uri = "https://api.github.com$caminho"; Headers = $h }
  if ($corpo) { $p.Body = ($corpo | ConvertTo-Json -Depth 5); $p.ContentType = 'application/json' }
  Invoke-RestMethod @p
}

try { $r = Api GET "/repos/$dono/$repo"; "repositorio ja existe: $($r.html_url)" }
catch {
  $r = Api POST '/user/repos' @{ name = $repo; description = 'Central Agro & Transporte - painel para TV (Be8)'; private = $false; has_issues = $false; has_wiki = $false; has_projects = $false }
  "repositorio criado: $($r.html_url)"
}

if (-not (Test-Path .git)) { git init --quiet --initial-branch main; git remote add origin "https://github.com/$dono/$repo.git" }
git add -A
$pendente = git status --porcelain
if ($pendente) {
  git commit --quiet -m $Mensagem -m "Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`nClaude-Session: https://claude.ai/code/session_01X7tGxd1fu8Txsppzjkm3n6"
  "commit: $(git log -1 --format='%h %s')"
} else { 'nada novo para gravar' }
git push --quiet -u origin main 2>&1 | Out-String
"enviado: $(git log -1 --format='%h') -> origin/main"

try { $pg = Api GET "/repos/$dono/$repo/pages"; "Pages ja ativo: $($pg.html_url) ($($pg.status))" }
catch {
  $pg = Api POST "/repos/$dono/$repo/pages" @{ source = @{ branch = 'main'; path = '/' } }
  "Pages ativado: $($pg.html_url)"
}
