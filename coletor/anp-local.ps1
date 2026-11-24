# Coleta da ANP feita no PC do Lucas (o site da ANP, gov.br, recusa conexoes do GitHub Actions).
# O Agendador de Tarefas do Windows roda este script a cada 6 h ("Central Agro - coleta ANP").
# Ele grava anp.json no ramo "anp" do repositorio; o coletor do GitHub usa essa copia quando a ANP recusa a conexao.
# Rodar na mao: powershell -ExecutionPolicy Bypass -File coletor\anp-local.ps1
$ErrorActionPreference = 'Continue'
$repo = Split-Path $PSScriptRoot -Parent
$tmp = Join-Path $env:LOCALAPPDATA 'central-agro-anp'
New-Item -ItemType Directory -Force $tmp | Out-Null
$saida = Join-Path $tmp 'anp.json'
$log = Join-Path $tmp 'ultima-coleta.log'
"inicio $(Get-Date -Format s)" | Out-File $log -Encoding utf8

# parte da ultima copia publicada (mantem o historico semanal e evita baixar o que nao mudou)
try { Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/LucasLDiogo/central-agro-transporte/anp/anp.json" -OutFile $saida -TimeoutSec 60 } catch { "sem copia anterior" | Out-File $log -Append }

$env:PYTHONIOENCODING = 'utf-8'
python "$repo\coletor\coletar.py" $saida "anp_semanal,anp_postos,anp_mensal" 2>&1 | Out-File $log -Append -Encoding utf8
if ($LASTEXITCODE -ne 0) { "coletor falhou" | Out-File $log -Append; exit 1 }

# deixa no arquivo so o que e da ANP
python -c "import json,sys;p=sys.argv[1];d=json.load(open(p,encoding='utf-8'));json.dump({k:d[k] for k in ('gerado_em','falhas','anp_semanal','anp_postos','anp_mensal') if k in d},open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))" $saida

# publica no ramo "anp" (credencial ja guardada pelo Git nesta maquina)
Push-Location $tmp
if (-not (Test-Path .git)) { git init --quiet --initial-branch anp 2>&1 | Out-Null }
git add anp.json 2>&1 | Out-Null
git -c user.name="central-agro-pc" -c user.email="lucasldiogo@lldworks.com.br" commit --quiet -m "anp $(Get-Date -Format s)" 2>&1 | Out-Null
git push --quiet --force "https://github.com/LucasLDiogo/central-agro-transporte.git" anp 2>&1 | Out-File $log -Append -Encoding utf8
Pop-Location
"fim $(Get-Date -Format s)" | Out-File $log -Append
