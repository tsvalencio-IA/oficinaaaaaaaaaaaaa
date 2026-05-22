      nome: getFirstText(emit, 'xNome'),
      fantasia: getFirstText(emit, 'xFant'),
      ie: getFirstText(emit, 'IE'),
      crt: getFirstText(emit, 'CRT'),
      endereco: {
        logradouro: getFirstText(emitEnd, 'xLgr'), numero: getFirstText(emitEnd, 'nro'), complemento: getFirstText(emitEnd, 'xCpl'),
        bairro: getFirstText(emitEnd, 'xBairro'), municipio: getFirstText(emitEnd, 'xMun'), uf: getFirstText(emitEnd, 'UF'), cep: getFirstText(emitEnd, 'CEP'), telefone: getFirstText(emitEnd, 'fone')
      }
    };
    const destinatario = {
      cnpj: getFirstText(dest, 'CNPJ') || getFirstText(dest, 'CPF'), nome: getFirstText(dest, 'xNome'), ie: getFirstText(dest, 'IE'), email: getFirstText(dest, 'email'),
      endereco: { logradouro:getFirstText(destEnd,'xLgr'), numero:getFirstText(destEnd,'nro'), bairro:getFirstText(destEnd,'xBairro'), municipio:getFirstText(destEnd,'xMun'), uf:getFirstText(destEnd,'UF'), cep:getFirstText(destEnd,'CEP'), telefone:getFirstText(destEnd,'fone') }
    };
    const dets = nodes(xml, 'det');
    const itens = dets.map(det => {
      const prod = child(det, 'prod');
      const icms = icmsData(det);
      const ipi = impostoGrupo(det, 'IPI', 'IPI');
      const pis = impostoGrupo(det, 'PIS', 'PIS');
      const cofins = impostoGrupo(det, 'COFINS', 'COFINS');
      const q = parseNum(getFirstText(prod, 'qCom'));
      const vu = parseNum(getFirstText(prod, 'vUnCom'));
      const vp = parseNum(getFirstText(prod, 'vProd'));
      const vd = parseNum(getFirstText(prod, 'vDesc'));
      const vItem = parseNum(getFirstText(det, 'vItem')) || Math.max(vp - vd, 0);
      const _codProd = getFirstText(prod, 'cProd');
      const _xProd = getFirstText(prod, 'xProd');
      const _splitProd = dividirDescricaoProdutoNFePro(_xProd, _codProd);
      return {
        nItem: det.getAttribute('nItem') || '',
        codigoFornecedor: _splitProd.codigoFornecedor,
        codigoComercial: _splitProd.codigoComercial,
        codigo: _splitProd.codigoFornecedor,
        oem: _splitProd.oem,
        ean: getFirstText(prod, 'cEAN'),
        descricaoOriginal: _splitProd.descricaoOriginal,
        descricao: _splitProd.descricaoLimpa,
        marca: _splitProd.marca,
        ncm: getFirstText(prod, 'NCM'), cest: getFirstText(prod, 'CEST'), cfop: getFirstText(prod, 'CFOP'),
        unidade: getFirstText(prod, 'uCom') || getFirstText(prod, 'uTrib') || 'UN',
        quantidade: q, valorUnitario: vu, valorProduto: vp, desconto: vd, valorLiquido: vItem,
        eanTrib: getFirstText(prod, 'cEANTrib'), unidadeTrib: getFirstText(prod, 'uTrib'), quantidadeTrib: parseNum(getFirstText(prod,'qTrib')), valorUnitarioTrib: parseNum(getFirstText(prod,'vUnTrib')),
        icms, ipi, pis, cofins,
        ibsCbs: {
          vIBS: parseNum(getFirstText(det, 'vIBS')),
          vCBS: parseNum(getFirstText(det, 'vCBS')),
          vIBSCBS: parseNum(getFirstText(det, 'vIBSCBS')),
          cClassTrib: getFirstText(det, 'cClassTrib') || getFirstText(det, 'cClassTribIBSCBS')
        },
        infAdProd: getFirstText(det, 'infAdProd'),
        destino: 'estoque', vinculo: '', osId: '', placa: '', observacaoDestino: ''
      };
    });
    const duplicatas = nodes(xml, 'dup').map(d => ({ numero:getFirstText(d,'nDup'), vencimento:getFirstText(d,'dVenc'), valor:parseNum(getFirstText(d,'vDup')) }));
    const pagamentos = nodes(xml, 'detPag').map(p => ({ tipo:getFirstText(p,'tPag'), descricao:getFirstText(p,'xPag'), valor:parseNum(getFirstText(p,'vPag')), data:getFirstText(p,'dPag') }));
    const info = {
      chave, modelo:getFirstText(ide,'mod'), serie:getFirstText(ide,'serie'), numero:getFirstText(ide,'nNF'), natureza:getFirstText(ide,'natOp'),
      dataEmissao:(getFirstText(ide,'dhEmi') || '').slice(0,10), dataSaida:(getFirstText(ide,'dhSaiEnt') || '').slice(0,10), tipoNF:getFirstText(ide,'tpNF'), finalidade:getFirstText(ide,'finNFe'),
      protocolo:getFirstText(prot,'nProt'), statusAutorizacao:getFirstText(prot,'cStat'), motivoAutorizacao:getFirstText(prot,'xMotivo'), recebidoEm:getFirstText(prot,'dhRecbto'),
      fornecedor, destinatario, itens,
      totais: {
        vProd: parseNum(getFirstText(total,'vProd')), vDesc: parseNum(getFirstText(total,'vDesc')), vNF: parseNum(getFirstText(total,'vNF')),
        vFrete: parseNum(getFirstText(total,'vFrete')), vSeg: parseNum(getFirstText(total,'vSeg')), vOutro: parseNum(getFirstText(total,'vOutro')),
        vIPI: parseNum(getFirstText(total,'vIPI')), vPIS: parseNum(getFirstText(total,'vPIS')), vCOFINS: parseNum(getFirstText(total,'vCOFINS')),
        vBC: parseNum(getFirstText(total,'vBC')), vICMS: parseNum(getFirstText(total,'vICMS')), vBCST: parseNum(getFirstText(total,'vBCST')), vST: parseNum(getFirstText(total,'vST')), vTotTrib: parseNum(getFirstText(total,'vTotTrib')),
        vIBS: parseNum(getFirstText(total,'vIBS')), vCBS: parseNum(getFirstText(total,'vCBS')), vIBSCBS: parseNum(getFirstText(total,'vIBSCBS'))
      },
      cobranca: { numero:getFirstText(fat,'nFat'), valorOriginal:parseNum(getFirstText(fat,'vOrig')), desconto:parseNum(getFirstText(fat,'vDesc')), valorLiquido:parseNum(getFirstText(fat,'vLiq')), duplicatas },
      pagamentos, referencias:nodes(xml, 'refNFe').map(r => r.textContent.trim()).filter(Boolean), infAdFisco:getFirstText(xml,'infAdFisco'), infCpl:getFirstText(xml,'infCpl'), rawXml:text
    };
    return info;
  }
  function osEmAtendimentoNF(os){
    const st = normalizeTextNF([os?.status, os?.etapa].filter(Boolean).join(' '));
    if(!st) return true;
    return !/(cancelad|entreg|finaliz|encerrad|recusad|arquivad|excluid)/.test(st);
  }
  function osBuscaConfereNF(os, busca){
    const termo = normalizeTextNF(busca || '');
    const placaBusca = normalizePlateNF(busca || '');
    if(!termo && !placaBusca) return true;
    const placa = placaDaOSNF(os);
    if(placaBusca && placa && (placa.includes(placaBusca) || placaBusca.includes(placa))) return true;
    return normalizeTextNF(textoBuscaOSNF(os)).includes(termo);
  }
  function listaOSDestinoNF(selectedOSId, busca){
    return (W.J?.os || [])
      .filter(o => osEmAtendimentoNF(o) || String(o.id || '') === String(selectedOSId || ''))
      .filter(o => osBuscaConfereNF(o, busca))
      .sort(ordenarOSDestinoNF);
  }
  function currentOSOptions(selectedOSId, busca){
    const lista = listaOSDestinoNF(selectedOSId, busca);
    return lista.map(o => {
      const v = (W.J?.veiculos || []).find(x => x.id === o.veiculoId) || {};
      const c = (W.J?.clientes || []).find(x => x.id === o.clienteId) || {};
      const placa = (o.placa || v.placa || 'S/PLACA').toUpperCase();
      const veic = [v.marca, v.modelo || o.veiculo].filter(Boolean).join(' ') || 'Veículo';
      const data = brDate((o.data || o.createdAt || o.updatedAt || '').slice(0,10));
      const status = o.status || 'em atendimento';
      const label = `${placa} — ${veic} — ${c.nome || o.cliente || 'Cliente'} — O.S. #${String(o.id||'').slice(-6).toUpperCase()} — ${status}${data ? ' — ' + data : ''}`;
      return `<option value="${esc(o.id)}" data-placa="${esc(placa)}" ${String(selectedOSId||'')===String(o.id)?'selected':''}>${esc(label)}</option>`;
    }).join('');
  }
  function rowTemplate(item){
    const i = item || {};
    const options = currentOSOptions(i.osId || '', i.vinculo || i.placa || '');
    const destino = i.destino || 'estoque';
    return `
      <div class="nf-real-row" style="border:1px solid var(--border);border-radius:4px;padding:10px;background:rgba(0,0,0,.08);display:grid;gap:8px;">
        <div style="display:grid;grid-template-columns:120px 130px minmax(220px,2fr) 120px 80px 105px 105px 105px 105px 34px;gap:8px;align-items:end;" class="nf-real-grid-main">
          <div><label class="j-label">Código fornecedor</label><input class="j-input nf-codforn" value="${esc(i.codigoFornecedor||i.codigo||'')}"></div>
          <div><label class="j-label">Código/OEM</label><input class="j-input nf-codigo" value="${esc(i.codigoComercial||i.oem||'')}"></div>
          <div><label class="j-label">Descrição limpa da peça</label><input class="j-input nf-desc" value="${esc(i.descricao||'')}" title="Original XML: ${esc(i.descricaoOriginal||i.descricao||'')}" placeholder="Descrição da peça"></div>
          <div><label class="j-label">Marca</label><input class="j-input nf-marca" value="${esc(i.marca||'')}"></div>
          <div><label class="j-label">Qtd</label><input class="j-input nf-qtd" inputmode="decimal" value="${esc(fmtQtd(i.quantidade||1))}" oninput="window.calcNFTotal()"></div>
          <div><label class="j-label">Custo un.</label><input class="j-input nf-custo" inputmode="decimal" value="${esc(fmtBR(i.valorUnitario||0))}" oninput="window.calcNFTotal()"></div>
          <div><label class="j-label">Desc.</label><input class="j-input nf-descvalor" inputmode="decimal" value="${esc(fmtBR(i.desconto||0))}" oninput="window.calcNFTotal()"></div>
          <div><label class="j-label">Venda</label><input class="j-input nf-venda" inputmode="decimal" value="${esc(fmtBR(i.venda || ((Number(i.valorUnitario)||0)*1.5)))}"></div>
          <div><label class="j-label">EAN</label><input class="j-input nf-ean" value="${esc(i.ean||'')}"></div>
          <button type="button" title="Remover item" onclick="this.closest('.nf-real-row').remove();window.calcNFTotal()" style="background:rgba(255,59,59,0.1);border:1px solid rgba(255,59,59,0.3);border-radius:2px;color:var(--danger);cursor:pointer;height:32px;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:end;" class="nf-real-grid-fiscal">
          <div><label class="j-label">NCM</label><input class="j-input nf-ncm-input" value="${esc(i.ncm||'')}"></div>
          <div><label class="j-label">CFOP</label><input class="j-input nf-cfop-input" value="${esc(i.cfop||'')}"></div>
          <div><label class="j-label">CEST</label><input class="j-input nf-cest-input" value="${esc(i.cest||'')}"></div>
          <div><label class="j-label">Total item XML</label><input class="j-input" value="R$ ${esc(fmtBR(i.valorLiquido || ((i.quantidade||1)*(i.valorUnitario||0)-(i.desconto||0))))}" readonly></div>
        </div>
        <div style="display:grid;grid-template-columns:170px minmax(220px,1fr) minmax(160px,1fr);gap:8px;align-items:end;" class="nf-real-grid-destino">
          <div><label class="j-label">Destino real da peça</label><select class="j-select nf-finalidade" onchange="window._nfeProToggleDestino(this)">
            <option value="estoque" ${destino==='estoque'?'selected':''}>Estoque</option>
            <option value="os" ${destino==='os'?'selected':''}>Vincular a O.S./veículo</option>
            <option value="placa" ${destino==='placa'?'selected':''}>Separar por placa</option>
            <option value="garantia" ${destino==='garantia'?'selected':''}>Garantia</option>
            <option value="devolucao" ${destino==='devolucao'?'selected':''}>Devolução</option>
            <option value="uso_interno" ${destino==='uso_interno'?'selected':''}>Uso interno</option>
            <option value="outro" ${destino==='outro'?'selected':''}>Outro</option>
          </select></div>
          <div class="nf-os-wrap" style="display:${destino==='os'?'block':'none'}">
            <label class="j-label">Selecionar O.S. em atendimento</label>
            <input class="j-input nf-os-busca" value="${esc(i.vinculo || i.placa || '')}" placeholder="Buscar placa / O.S. / cliente em atendimento" oninput="window.nfProFiltrarOS(this)" style="margin-bottom:6px;">
            <select class="j-select nf-os-select" onchange="window.nfProSelecionouOS(this)"><option value="">Escolha pela placa / O.S. / cliente...</option>${options}</select>
            <small class="nf-os-alert" style="display:block;margin-top:4px;color:var(--muted);font-family:var(--fm);font-size:.62rem;">Lista limitada a O.S. em atendimento.</small>
          </div>
          <div><label class="j-label">Placa/finalidade/observação</label><input class="j-input nf-vinculo" value="${esc(i.vinculo||'')}" placeholder="Ex.: ABC1234, garantia, uso interno..."></div>
        </div>
        <div style="font-family:var(--fm);font-size:.64rem;color:var(--muted);display:grid;grid-template-columns:repeat(4,1fr);gap:6px;" class="nf-real-tributos">
          <span>NCM: <b class="nf-ncm">${esc(i.ncm||'')}</b></span><span>CFOP: <b class="nf-cfop">${esc(i.cfop||'')}</b></span><span>CEST: <b class="nf-cest">${esc(i.cest||'')}</b></span><span>Total item: <b class="nf-total-item">R$ ${fmtBR(i.valorLiquido || ((i.quantidade||1)*(i.valorUnitario||0)-(i.desconto||0)))}</b></span>
        </div>
        <input type="hidden" class="nf-json" value="${esc(JSON.stringify(i))}">
      </div>`;
  }
  W._nfeProToggleDestino = function(sel){
    const row = sel.closest('.nf-real-row');
    const wrap = row?.querySelector('.nf-os-wrap');
    if(wrap) wrap.style.display = sel.value === 'os' ? 'block' : 'none';
  };
  W.nfProFiltrarOS = function(input){
    const row = input?.closest?.('.nf-real-row');
    const sel = row?.querySelector('.nf-os-select');
    if(!sel) return;
    const old = sel.value;
    const lista = listaOSDestinoNF(old, input.value || '');
    const vinc = row.querySelector('.nf-vinculo');
    if(vinc && input.value && (!vinc.value || normalizePlateNF(vinc.value) === normalizePlateNF(input.value))) vinc.value = String(input.value || '').toUpperCase();
    sel.innerHTML = `<option value="">Escolha pela placa / O.S. / cliente...</option>` + lista.map(o => {
      const v = (W.J?.veiculos || []).find(x => x.id === o.veiculoId) || {};
      const c = (W.J?.clientes || []).find(x => x.id === o.clienteId) || {};
      const placa = (o.placa || v.placa || 'S/PLACA').toUpperCase();
      const veic = [v.marca, v.modelo || o.veiculo].filter(Boolean).join(' ') || 'Veiculo';
      const data = brDate((o.data || o.createdAt || o.updatedAt || '').slice(0,10));
      const status = o.status || 'em atendimento';
      const label = `${placa} - ${veic} - ${c.nome || o.cliente || 'Cliente'} - O.S. #${String(o.id||'').slice(-6).toUpperCase()} - ${status}${data ? ' - ' + data : ''}`;
      return `<option value="${esc(o.id)}" data-placa="${esc(placa)}" ${String(old||'')===String(o.id)?'selected':''}>${esc(label)}</option>`;
    }).join('');
    if(old && Array.from(sel.options).some(opt => opt.value === old)) sel.value = old;
    const alert = row.querySelector('.nf-os-alert');
    if(alert) alert.textContent = lista.length ? `${lista.length} O.S. em atendimento encontrada(s).` : 'Nenhuma O.S. em atendimento encontrada para esta busca.';
  };
  W.nfProSelecionouOS = function(sel){
    const row = sel?.closest?.('.nf-real-row');
    const os = (W.J?.os || []).find(o => String(o.id || '') === String(sel?.value || ''));
    if(!row || !os) return;
    const placa = placaDaOSNF(os);
    const busca = row.querySelector('.nf-os-busca');
    if(busca) busca.value = placa || busca.value || '';
    const vinc = row.querySelector('.nf-vinculo');
    if(vinc) vinc.value = [placa, 'OS ' + String(os.id || '').slice(-6).toUpperCase()].filter(Boolean).join(' / ');
  };
  function renderParcels(dups){
    let box = $('nfParcelasBox');
    if(!box){
      const div = D.createElement('div'); div.id='nfParcelasBox';
      div.style.cssText='margin-top:10px;border:1px solid var(--border);background:rgba(0,0,0,.08);border-radius:4px;padding:10px;display:none;';
      const anchor = $('divParcelasNF')?.parentElement || $('nfPgtoForma')?.closest('.form-row') || $('containerItensNF')?.parentElement;
      anchor?.insertAdjacentElement('afterend', div); box = div;
    }
    const arr = Array.isArray(dups) ? dups : [];
    if(!arr.length){ box.style.display='none'; box.innerHTML=''; return; }
    box.style.display='block';
    box.innerHTML = `<div style="font-family:var(--fd);font-weight:800;margin-bottom:8px;color:var(--accent)">DUPLICATAS / BOLETOS DA NF</div>` + arr.map((d,idx)=>`
      <div class="nf-parcela-row" style="display:grid;grid-template-columns:80px 1fr 1fr;gap:8px;margin-bottom:6px;align-items:end;">
        <div><label class="j-label">Parc.</label><input class="j-input nf-parc-num" value="${esc(d.numero || String(idx+1).padStart(3,'0'))}"></div>
        <div><label class="j-label">Vencimento</label><input type="date" class="j-input nf-parc-venc" value="${esc(d.vencimento || '')}"></div>
        <div><label class="j-label">Valor</label><input class="j-input nf-parc-valor" inputmode="decimal" value="${esc(fmtBR(d.valor||0))}"></div>
      </div>`).join('');
  }
  function ensureAgrupamentoPeriodoBox(){
    let box = $('nfAgrupamentoPeriodoBox');
    if(!box){
      const div = D.createElement('div');
      div.id = 'nfAgrupamentoPeriodoBox';
      div.style.cssText = 'margin-top:10px;border:1px solid var(--border);background:rgba(0,212,255,.055);border-radius:4px;padding:10px;display:none;';
      const anchor = $('nfParcelasBox') || $('divParcelasNF')?.parentElement || $('containerItensNF')?.parentElement;
      anchor?.insertAdjacentElement('afterend', div);
      box = div;
    }
    box.innerHTML = `
      <div style="font-family:var(--fd);font-weight:800;margin-bottom:8px;color:var(--cyan)">AGRUPAMENTO POR FORNECEDOR / PERIODO</div>
      <div class="form-row cols-3">
        <div class="form-group"><label class="j-label">Periodo de agrupamento</label><input type="number" inputmode="numeric" class="j-input" id="nfAgrPeriodoDias" min="1" step="1" value="${esc($('nfAgrPeriodoDias')?.value || '7')}"></div>
        <div class="form-group"><label class="j-label">Vencimento do boleto agrupado</label><input type="date" class="j-input" id="nfAgrVenc" value="${esc($('nfAgrVenc')?.value || getVal('nfVenc') || isoToday())}"></div>
        <div class="form-group"><label class="j-label">Status inicial</label><select class="j-select" id="nfAgrStatus"><option value="Pendente">Pendente</option><option value="Aguardando Boleto">Aguardando Boleto</option></select></div>
      </div>
      <small style="display:block;color:var(--muted);font-family:var(--fm);font-size:.64rem;">A compra fica marcada para somar com outras compras do mesmo fornecedor no mesmo periodo. O vencimento informado e o vencimento do boleto consolidado.</small>
    `;
    return box;
  }
  function mostrarAgrupamentoPeriodoNF(show){
    const box = ensureAgrupamentoPeriodoBox();
    box.style.display = show ? 'block' : 'none';
  }
  function gerarParcelasManuais(){
    const forma = getVal('nfPgtoForma');
    if(forma === 'AgrupamentoPeriodo'){ renderParcels([]); mostrarAgrupamentoPeriodoNF(true); return; }
    if(!['Boleto','Parcelado'].includes(forma)){ renderParcels([]); return; }
    const n = parseInt(getVal('nfParcelas') || '1',10) || 1;
    const base = getVal('nfVenc') || isoToday();
    const total = calcTotalNumber();
    const dups = [];
    const baseDate = new Date(base + 'T12:00:00');
    for(let i=0;i<n;i++){
      const d = new Date(baseDate); d.setMonth(d.getMonth()+i);
      const iso = d.toISOString().slice(0,10);
      dups.push({ numero:String(i+1).padStart(3,'0'), vencimento:iso, valor: Math.round((total/n)*100)/100 });
    }
    renderParcels(dups);
  }
  function calcTotalNumber(){
    let total = 0;
