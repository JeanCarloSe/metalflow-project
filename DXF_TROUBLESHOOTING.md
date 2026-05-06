# 🔧 Guia de Troubleshooting - Importação DXF/DWG

## ❌ Erro: "Nenhuma layer encontrada. Verifique se o arquivo DXF é válido."

### Causas Possíveis e Soluções

#### 1. **Arquivo DXF Vazio ou Corrompido**
```
Sintoma: "Arquivo vazio. Nenhuma entidade ou layer encontrada."
Solução:
✓ Verificar tamanho do arquivo (deve ser > 1KB)
✓ Abrir arquivo em AutoCAD ou DWG viewer online
✓ Tentar re-exportar do CAD em formato DXF 2010 ou 2013
```

#### 2. **Formato Não Suportado**
```
Sintoma: "Erro ao fazer parse: parseString não está disponível"
Solução:
✓ Converter arquivo para DXF usando:
  - AutoCAD → "Salvar Como" → DXF 2013 (.dxf)
  - Online converter: https://cloudconvert.com/dwg-to-dxf
✓ NÃO usar formatos: DGN, IGES, STEP (ainda não suportados)
```

#### 3. **DWG Sem Conversão**
```
Sintoma: Arquivo .dwg é rejeitado
Solução:
✓ Converter DWG → DXF primeiro:
  - AutoCAD: Save As → DXF
  - LibreCAD: Export → DXF
  - Online: https://Online-convert.com
  - CloudConvert: https://cloudconvert.com/dwg-to-dxf
```

#### 4. **Layers Vazias (Sem Entidades)**
```
Sintoma: Arquivo importa mas mostra "0 entidades"
Solução:
✓ Verificar se geometria está em layer com nome
✓ Não usar layer "0" (camada padrão)
✓ Renomear layers: CTRL+H (Find/Replace) no DXF
✓ Usar notepad para editar .dxf diretamente:
  [SEARCH]
    0
    LAYER
    2
    0
  [REPLACE WITH]
    0
    LAYER
    2
    Peça-1
```

#### 5. **Dimensões Muito Pequenas**
```
Sintoma: Arquivo carrega mas com dimensões 0×0
Solução:
✓ Sistema agora cria fallback: 100×100×10mm
✓ Você pode editar dimensões manualmente após import
✓ Verificar unidades do DXF original:
  - Converter mm ↔ cm ↔ m conforme necessário
```

#### 6. **Arquivo Muito Grande**
```
Sintoma: "Erro de memória" ou travamento durante parse
Solução:
✓ Limitar a ~5MB por arquivo
✓ Dividir em múltiplos arquivos menores
✓ Remover geometria desnecessária no CAD:
  - Apagar blocos não utilizados
  - Remover layers ocultas
  - Purgar blocos (PURGE no AutoCAD)
```

---

## 🔍 Como Verificar Se Seu DXF É Válido

### Opção 1: Online Viewer
1. Acesse: https://viewer.autodesk.com (Autodesk)
2. Upload arquivo .dxf
3. Se visualizar geometria → arquivo é válido
4. Se não visualizar → arquivo pode estar corrompido

### Opção 2: LibreCAD (Gratuito)
```bash
# Instalar LibreCAD
brew install librecad  # macOS
# ou download em https://librecad.org

# Abrir arquivo .dxf
```
- Se abrir sem erro → arquivo é válido
- Se não abrir → arquivo corrompido

### Opção 3: Inspecionar com Editor de Texto
```bash
# macOS/Linux
file seu-arquivo.dxf      # Verificar tipo MIME
head -50 seu-arquivo.dxf  # Ver primeiras linhas

# Windows
type seu-arquivo.dxf
```

Procure pela seção `ENTITIES`. Se existir → arquivo tem geometria.

---

## 📋 Formatos Suportados Atualmente

| Formato | Suporta | Conversão Recomendada |
|---------|---------|-------------------
| .DXF | ✅ Sim | - |
| .DWG | ❌ Não | DWG → DXF |
| .IGES | ❌ Não | IGES → DXF |
| .STEP | ❌ Não | STEP → IGES → DXF |
| .PDF | ⏳ Em breve | - |
| .Revit | ⏳ Em breve | Revit → DXF |

**Como converter para DXF:**

### De AutoCAD DWG
```
File → Save As → Format: DXF 2013 (.dxf)
```

### De Revit
```
File → Export → CAD Format → DXF (Autodesk DXF)
```

### De Solidworks STEP
```
1. Abrir STEP em LibreCAD
2. File → Save As → DXF
```

### Online (sem software)
```
1. Acesse: https://cloudconvert.com
2. Upload arquivo
3. Select output: DXF
4. Download resultado
```

---

## 📊 Estrutura de Arquivo DXF Válido

Um DXF válido deve conter:

```dxf
0
SECTION
2
HEADER
...
0
SECTION
2
LAYERS           ← IMPORTANTE: Define as camadas
0
LAYER
2
Peça-1          ← Nome da layer
...
0
SECTION
2
ENTITIES        ← IMPORTANTE: Contém a geometria
0
LINE            ← Tipo de entidade
8
Peça-1          ← Associada à layer
10
100.0           ← Coordenada X inicial
20
200.0           ← Coordenada Y inicial
11
200.0           ← Coordenada X final
21
300.0           ← Coordenada Y final
...
0
ENDSEC
0
EOF
```

---

## 🛠️ Ferramentas Recomendadas

### Visualizar/Editar DXF Online
- [Autodesk Viewer](https://viewer.autodesk.com) - Profissional, 50+ formatos
- [DWG FastView](https://www.dwgfastview.com) - Rápido, leve
- [eDrawings](https://www.edrawingsviewer.com) - Suporta múltiplos formatos
- [LibreCAD Online](https://librecad.org) - Código aberto

### Converter Formatos
- [CloudConvert](https://cloudconvert.com) - Conversão em lote
- [Online-Convert](https://online-convert.com) - Simples, rápido
- [Zamzar](https://www.zamzar.com) - Múltiplos formatos

### Editar/Limpar DXF
- [LibreCAD](https://librecad.org) - Gratuito, open-source
- [DraftSight](https://www.3dvia.com/draftsight) - Grátis/Pago
- [AutoCAD (Prova)](https://www.autodesk.com/products/autocad/free-trial) - 30 dias

---

## 💡 Dicas para Melhorar Arquivos DXF

### No AutoCAD
```autocad
1. PURGE     → Remove blocos/layers desnecessários
2. AUDIT     → Verifica integridade
3. RECOVER   → Recupera arquivo corrompido
4. DXFOUT    → Exporta para DXF limpo
```

### No LibreCAD
```
1. Select All (CTRL+A)
2. Edit → Delete Duplicates
3. File → Save → Purge All
4. File → Export → DXF
```

### No Editor de Texto
Remova seções desnecessárias:
- THUMBNAILIMAGE
- VPORT (viewport não usada)
- DIMSTYLE (se não usa cotas)

---

## 📝 Exemplo: Como Corrigir um DXF via Texto

### Problema: Layer está "0" em vez de ter nome descritivo

**Antes:**
```dxf
0
LINE
8
0              ← Layer padrão (ruim)
...
```

**Depois:**
```dxf
0
LINE
8
Peça-1         ← Layer descritiva (bom)
...
```

**Como fazer:**
```bash
# macOS/Linux
sed -i '' 's/^8$/8-novo/' seu-arquivo.dxf
sed -i '' 's/^0$/Peça-1/' seu-arquivo.dxf

# Ou usar Find/Replace em editor de texto
```

---

## 🐛 Debugging: Ativar Logs

No navegador, abra DevTools (F12) e rode:

```javascript
// Ver logs de parse
localStorage.setItem('DEBUG_DXF', 'true');
// Recarregar página
// Voltar a DevTools > Console

// Ver estrutura do arquivo parseado
fetch('seu-arquivo.dxf')
  .then(r => r.text())
  .then(dxfText => {
    console.log('First 500 chars:', dxfText.substring(0, 500));
    // Procurar por "ENTITIES" na saída
  });
```

---

## ✅ Checklist: Validar DXF Antes de Importar

- [ ] Arquivo tem extensão `.dxf` (não `.dwg`, `.iges`, etc)
- [ ] Tamanho > 1 KB (não está vazio)
- [ ] Abre em [Autodesk Viewer](https://viewer.autodesk.com)
- [ ] Tem camadas (layers) definidas
- [ ] Tem geometria (ENTITIES > 0)
- [ ] Coordenadas não estão todas em (0,0,0)
- [ ] Unidades são milímetros (mm)

---

## 📞 Se Nada Funcionar

1. **Registre os erros:**
   ```bash
   # Abra DevTools (F12)
   # Selecione aba "Console"
   # Tente fazer import
   # Copie toda mensagem de erro
   ```

2. **Envie arquivo para teste:**
   - Teste arquivo em [Autodesk Viewer](https://viewer.autodesk.com)
   - Se não funcionar lá → arquivo problemático
   - Se funciona lá → reportar bug

3. **Formato alternativo:**
   - Tente com STEP, IGES, PDF (suporte em breve)
   - Ou converta via online tool primeiro

---

## 🔗 Recursos Úteis

- **DXF Spec**: https://www.autodesk.com/techpubs/autocad/dxf/
- **DXF Parser Docs**: https://www.npmjs.com/package/dxf
- **DXF Tutorials**: https://www.lynda.com/AutoCAD-tutorials
- **Community Help**: https://forums.autodesk.com

---

**Última atualização**: Maio 2026
