#!/bin/bash

# 📊 Monitor de Erros em Tempo Real
# Aguarda novos relatórios e mostra mudanças

REPORTS_DIR=".error-reports"
LAST_REPORT=""

echo "📊 Monitorador de Erros - Aston Metalflow"
echo "Aguardando relatórios... (Ctrl+C para sair)"
echo ""

while true; do
  # Obter último relatório
  LATEST=$(ls -t "$REPORTS_DIR"/* 2>/dev/null | head -1)

  if [ -f "$LATEST" ] && [ "$LATEST" != "$LAST_REPORT" ]; then
    LAST_REPORT="$LATEST"

    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║          📋 NOVO RELATÓRIO DISPONÍVEL                  ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""

    # Extrair dados
    TIMESTAMP=$(jq -r '.timestamp' "$LATEST")
    CHECKS=$(jq -r '.checksRun' "$LATEST")
    ISSUES=$(jq -r '.totalIssues' "$LATEST")
    ISSUES_LIST=$(jq -r '.issues[]' "$LATEST" 2>/dev/null)

    echo "⏰ Timestamp: $TIMESTAMP"
    echo "🧪 Checks executados: $CHECKS"
    echo "❌ Problemas encontrados: $ISSUES"

    if [ "$ISSUES" -gt 0 ]; then
      echo ""
      echo "⚠️  PROBLEMAS:"
      echo "$ISSUES_LIST" | nl
    else
      echo "✅ Nenhum problema!"
    fi

    echo ""
  fi

  sleep 5
done
