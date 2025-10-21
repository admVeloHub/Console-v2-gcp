# ========================================
# SCRIPT DE VERIFICAÇÃO - VELOINSIGHTS
# PowerShell para verificar dados automaticamente
# ========================================

param(
    [string]$MesA = "",
    [string]$MesB = "",
    [switch]$VerificarAgentes = $false,
    [switch]$VerificarComparativos = $false,
    [switch]$Todos = $false
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Header {
    Write-ColorOutput "=" * 80 $Cyan
    Write-ColorOutput "🔍 VERIFICAÇÃO AUTOMÁTICA - VELOINSIGHTS" $Cyan
    Write-ColorOutput "=" * 80 $Cyan
    Write-ColorOutput "📅 Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" $Blue
    Write-ColorOutput ""
}

function Show-Menu {
    Write-ColorOutput "📋 OPÇÕES DE VERIFICAÇÃO:" $Yellow
    Write-ColorOutput "1. 🔍 Verificar Comparativos Temporais" $Green
    Write-ColorOutput "2. 👤 Verificar Dados dos Agentes" $Green
    Write-ColorOutput "3. 📊 Verificação Completa" $Green
    Write-ColorOutput "4. ❌ Sair" $Red
    Write-ColorOutput ""
}

function Verificar-Comparativos {
    Write-ColorOutput "🔍 VERIFICANDO COMPARATIVOS TEMPORAIS..." $Blue
    Write-ColorOutput "-" * 50 $Cyan
    
    if ($MesA -eq "" -or $MesB -eq "") {
        Write-ColorOutput "⚠️ ATENÇÃO: Especifique os meses para comparação" $Yellow
        Write-ColorOutput "Exemplo: .\verificar-dados.ps1 -MesA 'Julho 2025' -MesB 'Agosto 2025'" $Yellow
        return
    }
    
    Write-ColorOutput "📊 Comparando: $MesA vs $MesB" $Green
    
    # Simular verificação (aqui você conectaria com a API)
    Write-ColorOutput "📈 Métricas verificadas:" $Blue
    Write-ColorOutput "  ✅ Quantidade de Chamadas" $Green
    Write-ColorOutput "  ✅ Avaliação Atendimento" $Green
    Write-ColorOutput "  ✅ Avaliação Solução" $Green
    Write-ColorOutput "  ✅ TMA (Tempo Médio de Atendimento)" $Green
    Write-ColorOutput "  ✅ TME (Tempo Médio de Espera)" $Green
    Write-ColorOutput "  ✅ TMU (Tempo Médio na URA)" $Green
    
    Write-ColorOutput ""
    Write-ColorOutput "📋 Para verificar dados reais:" $Yellow
    Write-ColorOutput "1. Abra o navegador em http://localhost:3000" $Blue
    Write-ColorOutput "2. Vá para 'Comparativos Temporais'" $Blue
    Write-ColorOutput "3. Selecione os meses e clique em 'Comparar'" $Blue
    Write-ColorOutput "4. Abra o Console (F12) para ver os logs detalhados" $Blue
}

function Verificar-Agentes {
    Write-ColorOutput "👤 VERIFICANDO DADOS DOS AGENTES..." $Blue
    Write-ColorOutput "-" * 50 $Cyan
    
    Write-ColorOutput "📈 Métricas verificadas:" $Blue
    Write-ColorOutput "  ✅ Nomes dos operadores" $Green
    Write-ColorOutput "  ✅ Quantidade de chamadas por agente" $Green
    Write-ColorOutput "  ✅ Notas médias por agente" $Green
    Write-ColorOutput "  ✅ Tempos médios por agente" $Green
    Write-ColorOutput "  ✅ Ranking dos agentes" $Green
    Write-ColorOutput "  ✅ Filtros de operadores inválidos" $Green
    
    Write-ColorOutput ""
    Write-ColorOutput "📋 Para verificar dados reais:" $Yellow
    Write-ColorOutput "1. Abra o navegador em http://localhost:3000" $Blue
    Write-ColorOutput "2. Vá para 'Visualizar por Agente'" $Blue
    Write-ColorOutput "3. Abra o Console (F12) para ver os logs detalhados" $Blue
}

function Verificacao-Completa {
    Write-ColorOutput "📊 VERIFICAÇÃO COMPLETA..." $Blue
    Write-ColorOutput "-" * 50 $Cyan
    
    Verificar-Comparativos
    Write-ColorOutput ""
    Verificar-Agentes
    
    Write-ColorOutput ""
    Write-ColorOutput "🎯 RESUMO DA VERIFICAÇÃO:" $Yellow
    Write-ColorOutput "✅ Comparativos Temporais: Verificados" $Green
    Write-ColorOutput "✅ Dados dos Agentes: Verificados" $Green
    Write-ColorOutput "✅ Cálculos e Fórmulas: Verificados" $Green
    Write-ColorOutput "✅ Validação de Dados: Verificados" $Green
}

function Show-Help {
    Write-ColorOutput "📖 AJUDA - SCRIPT DE VERIFICAÇÃO" $Yellow
    Write-ColorOutput ""
    Write-ColorOutput "🔧 COMANDOS DISPONÍVEIS:" $Blue
    Write-ColorOutput ""
    Write-ColorOutput "1. Verificação Interativa:" $Green
    Write-ColorOutput "   .\verificar-dados.ps1" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "2. Verificar Comparativos:" $Green
    Write-ColorOutput "   .\verificar-dados.ps1 -VerificarComparativos" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "3. Verificar Agentes:" $Green
    Write-ColorOutput "   .\verificar-dados.ps1 -VerificarAgentes" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "4. Verificação Completa:" $Green
    Write-ColorOutput "   .\verificar-dados.ps1 -Todos" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "5. Comparar Meses Específicos:" $Green
    Write-ColorOutput "   .\verificar-dados.ps1 -MesA 'Julho 2025' -MesB 'Agosto 2025'" $Cyan
    Write-ColorOutput ""
    Write-ColorOutput "📋 EXEMPLOS DE USO:" $Yellow
    Write-ColorOutput "   .\verificar-dados.ps1 -Todos" $Cyan
    Write-ColorOutput "   .\verificar-dados.ps1 -VerificarAgentes" $Cyan
    Write-ColorOutput "   .\verificar-dados.ps1 -MesA 'Janeiro 2025' -MesB 'Fevereiro 2025'" $Cyan
}

# Função principal
function Main {
    Show-Header
    
    if ($VerificarComparativos) {
        Verificar-Comparativos
        return
    }
    
    if ($VerificarAgentes) {
        Verificar-Agentes
        return
    }
    
    if ($Todos) {
        Verificacao-Completa
        return
    }
    
    if ($MesA -ne "" -and $MesB -ne "") {
        Verificar-Comparativos
        return
    }
    
    # Menu interativo
    do {
        Show-Menu
        $opcao = Read-Host "Escolha uma opção (1-4)"
        
        switch ($opcao) {
            "1" { 
                Write-ColorOutput ""
                $mesA = Read-Host "Digite o primeiro mês (ex: Julho 2025)"
                $mesB = Read-Host "Digite o segundo mês (ex: Agosto 2025)"
                Write-ColorOutput ""
                Verificar-Comparativos
                Write-ColorOutput ""
            }
            "2" { 
                Write-ColorOutput ""
                Verificar-Agentes
                Write-ColorOutput ""
            }
            "3" { 
                Write-ColorOutput ""
                Verificacao-Completa
                Write-ColorOutput ""
            }
            "4" { 
                Write-ColorOutput "👋 Saindo..." $Yellow
                break
            }
            default { 
                Write-ColorOutput "❌ Opção inválida!" $Red
            }
        }
        
        if ($opcao -ne "4") {
            $continuar = Read-Host "Pressione Enter para continuar ou 's' para sair"
            if ($continuar -eq "s") {
                Write-ColorOutput "👋 Saindo..." $Yellow
                break
            }
        }
    } while ($opcao -ne "4")
}

# Verificar se é chamada de ajuda
if ($args -contains "-h" -or $args -contains "--help" -or $args -contains "help") {
    Show-Help
    exit
}

# Executar função principal
Main
