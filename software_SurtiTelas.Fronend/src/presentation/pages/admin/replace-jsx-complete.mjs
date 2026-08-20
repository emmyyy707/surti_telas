import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'PedidosPersonalizados.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '  return (\n    <div>';
const endMarker = '      </div>\n    );\n  };';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found');
  process.exit(1);
}

const before = content.substring(0, startIdx);
const after = content.substring(endIdx + endMarker.length);

const newJSX = `  return (
    <div className={s.pageContainer}>
      <div className={s.header}>
        <div className={s.headerContent}>
          <h1 className={s.pageTitle}>Cotizaciones</h1>
          <p className={s.pageSubtitle}>Gestiona solicitudes, cotizaciones y conversión a pedidos</p>
        </div>
        <Button onClick={openCreate} className={s.primaryButton}>
          <Plus size={18} />
          <span>Nuevo pedido</span>
        </Button>
      </div>

      <div className={s.metricsGrid}>
        <div className={\`\${s.metricCard} \${s.metricCardPrimary}\`}>
          <div className={s.metricIconWrap}>
            <FileText size={22} />
          </div>
          <div className={s.metricContent}>
            <span className={s.metricValue}>{totalOrders}</span>
            <span className={s.metricLabel}>Total</span>
          </div>
        </div>
        <div className={\`\${s.metricCard} \${s.metricCardWarning}\`}>
          <div className={s.metricIconWrap}>
            <Eye size={22} />
          </div>
          <div className={s.metricContent}>
            <span className={s.metricValue}>{pendingOrders}</span>
            <span className={s.metricLabel}>Pendientes</span>
          </div>
        </div>
        <div className={\`\${s.metricCard} \${s.metricCardSuccess}\`}>
          <div className={s.metricIconWrap}>
            <CheckCircle size={22} />
          </div>
          <div className={s.metricContent}>
            <span className={s.metricValue}>{quotedOrders}</span>
            <span className={s.metricLabel}>Cotizados</span>
          </div>
        </div>
        <div className={\`\${s.metricCard} \${s.metricCardInfo}\`}>
          <div className={s.metricIconWrap}>
            <RefreshCcw size={22} />
          </div>
          <div className={s.metricContent}>
            <span className={s.metricValue}>{productionOrders}</span>
            <span className={s.metricLabel}>En producción</span>
          </div>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.filters}>
          <div className={s.searchBox}>
            <Search className={s.searchIcon} size={16} />
            <input
              className={s.searchInput}
              placeholder="Buscar por solicitud o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'PENDIENTE', label: 'Pendiente' },
              { value: 'ACEPTADO', label: 'Aceptado' },
              { value: 'CANCELADO', label: 'Cancelado' },
              { value: 'EN_REVISION', label: 'En revisión' },
              { value: 'COTIZADO', label: 'Cotizado' },
              { value: 'COTIZACION_ACEPTADA', label: 'Cotización aceptada' },
              { value: 'COTIZACION_RECHAZADA', label: 'Cotización rechazada' },
              { value: 'PAGO_PENDIENTE', label: 'Pago pendiente' },
              { value: 'PAGO_EN_VERIFICACION', label: 'Pago en verificación' },
              { value: 'PAGO_APROBADO', label: 'Pago aprobado' },
              { value: 'CONVERTIDO_A_PEDIDO', label: 'Convertido a pedido' },
              { value: 'EN_PRODUCCION', label: 'En producción' },
              { value: 'COMPLETADO', label: 'Completado' },
              { value: 'VENCIDO', label: 'Vencido' },
            ]}
            placeholder="Todos los estados"
            className={s.statusSelect}
          />
          {statusFilter && (
            <Button variant="ghost" size="icon" onClick={() => setStatusFilter('')} title="Limpiar filtro" className={s.clearFilterButton}>
              <X size={16} />
            </Button>
          )}
          <Button onClick={loadOrders} disabled={loading} variant="secondary" className={s.refreshButton}>
            <RefreshCcw size={16} />
            <span>Actualizar</span>
          </Button>
        </div>

        <div className={s.tableContainer}>
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage={loading ? 'Cargando...' : 'No hay pedidos personalizados'}
            enableRowSelection={false}
            maxVisibleColumns={10}
            serverMode
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
             actions={(row) => [
                { label: 'Ver detalle', icon: <Eye size={14} />, onClick: () => { setSelectedOrder(row); setDetailOpen(true); } },
                { label: 'Historial', icon: <FileText size={14} />, onClick: () => openHistory(row) },
                { label: 'Editar', icon: <Edit3 size={14} />, onClick: () => openEdit(row) },
                { label: 'Cambiar estado', onClick: () => { setStatusConfirm(row); setSelectedStatus(null); } },
                ...(!row.anticipoPagado && (row.paymentKey || row.paymentProofUrl) ? [{ label: 'Confirmar pago', onClick: () => setPaymentConfirm(row) }] : []),
                { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(row), danger: true },
              ]}
          />
        </div>
      </div>

      <Modal
        open={!!statusConfirm}
        onClose={() => { setStatusConfirm(null); setSelectedStatus(null); }}
        title={\`Cambiar estado de \${statusConfirm?.numeroSolicitud ?? ''}\`}
        description={selectedStatus === 'ACEPTADO' ? '¿Aceptas esta solicitud?' : '¿Cancelas esta solicitud?'}
        footer={
          <div className={s.formActions}>
            <Button variant="secondary" onClick={() => { setStatusConfirm(null); setSelectedStatus(null); }}>No</Button>
            <Button variant={selectedStatus === 'ACEPTADO' ? 'success' : 'danger'} onClick={handleChangeStatus} loading={saving}>
              {selectedStatus === 'ACEPTADO' ? 'Sí, aceptar' : 'Sí, cancelar'}
            </Button>
          </div>
        }
      >
        <div className={s.form}>
          <p>¿Estás seguro de que deseas cambiar el estado de esta solicitud a <strong>{selectedStatus === 'ACEPTADO' ? 'Aceptado' : 'Cancelado'}</strong>?</p>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={\`Solicitud \${selectedOrder?.numeroSolicitud ?? ''}\`}
        size="lg"
        footer={
          <div className={s.formActions}>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            {selectedOrder && (selectedOrder.estado === 'EN_REVISION' || selectedOrder.estado === 'COTIZADO') && (
              <Button onClick={() => openQuotationEditor(selectedOrder)}>
                {selectedOrder.cotizacion ? 'Editar cotización' : 'Generar cotización'}
              </Button>
            )}
            {selectedOrder && selectedOrder.estado === 'PAGO_PENDIENTE' && !selectedOrder.anticipoPagado && (
              <Button onClick={() => { setPaymentConfirm(selectedOrder); setDetailOpen(false); }}>
                Confirmar anticipo
              </Button>
            )}
            {selectedOrder && selectedOrder.estado === 'PAGO_APROBADO' && (
              <Button onClick={async () => {
                try {
                  await customOrdersApi.convertToOrder(selectedOrder.id);
                  toast.success('Pedido convertido exitosamente');
                  setDetailOpen(false);
                  void loadOrders();
                } catch {
                  toast.error('No fue posible convertir a pedido');
                }
              }}>
                Convertir a pedido
              </Button>
            )}
          </div>
        }
      >
        {selectedOrder && (
          <div className={s.form}>
            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Datos del cliente</h3>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Cliente</span>
                <span className={s.infoValue}>{selectedOrder.clienteNombre}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Email</span>
                <span className={s.infoValue}>{selectedOrder.clienteEmail ?? '—'}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Teléfono</span>
                <span className={s.infoValue}>{selectedOrder.clienteTelefono ?? '—'}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Uso final</span>
                <span className={s.infoValue}>{selectedOrder.usoFinal ?? '—'}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Fecha deseada</span>
                <span className={s.infoValue}>{selectedOrder.fechaEntregaDeseada ? new Date(selectedOrder.fechaEntregaDeseada).toLocaleDateString() : '—'}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Dirección</span>
                <span className={s.infoValue}>{selectedOrder.direccionEntrega ?? '—'}</span>
              </div>
            </div>

            {selectedOrder.cotizacion && (
              <div className={s.sectionBlock}>
                <div className={s.sectionHeader}>
                  <h3 className={s.sectionTitle}>Cotización</h3>
                  <Badge variant={getQuotationAdminStatus(selectedOrder)}>{getQuotationAdminStatusLabel(selectedOrder)}</Badge>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Número</span>
                  <span className={s.infoValue}>{selectedOrder.cotizacion.numeroCotizacion}</span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Válida hasta</span>
                  <span className={s.infoValue}>{selectedOrder.cotizacion.validaHasta ? new Date(selectedOrder.cotizacion.validaHasta).toLocaleDateString() : '—'}</span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Condiciones</span>
                  <span className={s.infoValue}>{selectedOrder.cotizacion.condicionesPago ?? '—'}</span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Tiempo estimado</span>
                  <span className={s.infoValue}>{selectedOrder.cotizacion.tiempoEstimadoDias ? \`\${selectedOrder.cotizacion.tiempoEstimadoDias} días\` : '—'}</span>
                </div>
              </div>
            )}

            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Productos / items</h3>
              {selectedOrder.items?.length ? (
                <div className={s.tableWrapper}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Talla</th>
                        <th>Color</th>
                        <th>Material</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className={s.tdPrimary}>{item.descripcion}</td>
                          <td>{item.tipo_personalizacion}</td>
                          <td className={s.tdCenter}>{item.cantidad}</td>
                          <td>{item.talla ?? '—'}</td>
                          <td>{item.color ?? '—'}</td>
                          <td>{item.material ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={s.emptyRow}>Sin items</p>
              )}
            </div>

            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Pago</h3>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Llave</span>
                <span className={s.infoValue}>{selectedOrder.paymentKey ?? '—'}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Comprobante</span>
                <span className={s.infoValue}>
                  {selectedOrder.paymentProofUrl ? <a className={s.fileLink} href={selectedOrder.paymentProofUrl} target="_blank" rel="noreferrer">Ver comprobante</a> : '—'}
                </span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Anticipo pagado</span>
                <span className={s.infoValue}>{selectedOrder.anticipoPagado ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!quotationOpen}
        onClose={() => setQuotationOpen(false)}
        title={editingQuotationId ? 'Editar cotización' : 'Generar cotización'}
        size="xl"
        footer={
          <div className={s.formActions}>
            <Button variant="secondary" onClick={() => setQuotationOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveQuotation} loading={savingQuotation}>Guardar cotización</Button>
            <Button onClick={handleSendQuotation} disabled={!selectedOrder?.cotizacion}>Enviar cotización</Button>
          </div>
        }
      >
        {selectedOrder && (
          <div className={s.form}>
            <div className={s.sectionBlock}>
              <div className={s.quotationStatusRow}>
                <Badge variant={getQuotationAdminStatus(selectedOrder)}>{getQuotationAdminStatusLabel(selectedOrder)}</Badge>
                {selectedOrder.cotizacion?.negociaciones > 0 && (
                  <span className={s.quotationNegotiation}>{selectedOrder.cotizacion.negociaciones} negociaciones</span>
                )}
              </div>
            </div>

            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Conceptos</h3>
              {quotationProducts.map((product, pIndex) => (
                <div key={product.id ?? pIndex} className={s.productCard}>
                  <div className={s.productHeader} onClick={() => toggleProductExpanded(pIndex)}>
                    <div className={s.productInfo}>
                      <span className={s.productTitle}>{product.nombre ?? \`Producto \${pIndex + 1}\`}</span>
                      <span className={s.productMeta}>{product.tipo} · {product.cantidad} uds</span>
                    </div>
                    <span className={s.productSubtotal}>{\`$\${calcLineSubtotal(product).toLocaleString()}\`}</span>
                  </div>
                  {product.expanded && (
                    <div className={s.productBody}>
                      <div className={s.productConceptsTable}>
                        <div className={s.productConceptsHeader}>
                          <span>Tipo</span>
                          <span>Descripción</span>
                          <span style={{ textAlign: 'right' }}>Cant.</span>
                          <span style={{ textAlign: 'right' }}>Precio</span>
                          <span style={{ textAlign: 'right' }}>Subtotal</span>
                          <span />
                        </div>
                        {(product.conceptos ?? []).map((concepto, cIndex) => (
                          <div key={cIndex} className={s.productConceptRow}>
                            <span className={s.tdPrimary}>{concepto.tipo}</span>
                            <span>{concepto.descripcion}</span>
                            <span style={{ textAlign: 'right' }}>{concepto.cantidad}</span>
                            <span style={{ textAlign: 'right' }}>{\`$\${Number(concepto.precioUnitario ?? 0).toLocaleString()}\`}</span>
                            <span style={{ textAlign: 'right', fontWeight: 600 }}>{\`$\${calcLineSubtotal(concepto).toLocaleString()}\`}</span>
                            <span className={s.productConceptActions}>
                              <Button variant="ghost" size="icon" onClick={() => removeQuotationLine(pIndex, cIndex)}>
                                <Trash2 size={14} />
                              </Button>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className={s.quotationAddLine} onClick={() => addQuotationLine(pIndex)}>
                        <PlusCircle size={16} />
                        <span>Agregar concepto</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className={s.quotationAddLine} onClick={addQuotationProduct}>
                <Plus size={16} />
                <span>Agregar producto</span>
              </div>
            </div>

            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Condiciones</h3>
              <div className={s.formRow}>
                <div className={s.field}>
                  <label className={s.label}>Tiempo estimado (días)</label>
                  <input
                    type="number"
                    className={s.quotationInput}
                    value={quotation.estimatedDays ?? ''}
                    onChange={(e) => setQuotation({ ...quotation, estimatedDays: Number(e.target.value) })}
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Condiciones de pago</label>
                  <input
                    type="text"
                    className={s.quotationInput}
                    value={quotation.paymentTerms ?? ''}
                    onChange={(e) => setQuotation({ ...quotation, paymentTerms: e.target.value })}
                  />
                </div>
              </div>
              <div className={s.field} style={{ marginTop: 12 }}>
                <label className={s.label}>Observaciones</label>
                <textarea
                  className={s.textarea}
                  value={quotation.notes ?? ''}
                  onChange={(e) => setQuotation({ ...quotation, notes: e.target.value })}
                />
              </div>
            </div>

            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Resumen</h3>
              <div className={s.quotationSummary}>
                <div className={s.quotationSummaryRow}>
                  <span>Subtotal</span>
                  <span className={s.quotationSubtotal}>{\`$\${calcQuotation().subtotal.toLocaleString()}\`}</span>
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Descuento</span>
                  <input
                    type="number"
                    className={s.quotationInput}
                    value={quotation.discount}
                    onChange={(e) => setQuotation({ ...quotation, discount: Number(e.target.value) })}
                  />
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Impuestos (%)</span>
                  <input
                    type="number"
                    className={s.quotationInput}
                    value={quotation.taxRate}
                    onChange={(e) => setQuotation({ ...quotation, taxRate: Number(e.target.value) })}
                  />
                </div>
                <div className={s.quotationSummaryTotal}>
                  <span>Total</span>
                  <span>{\`$\${calcQuotation().total.toLocaleString()}\`}</span>
                </div>
                <div className={s.quotationSummaryRow}>
                  <span>Anticipo (%)</span>
                  <input
                    type="number"
                    className={s.quotationInput}
                    value={quotation.advanceRate}
                    onChange={(e) => setQuotation({ ...quotation, advanceRate: Number(e.target.value) })}
                  />
                </div>
                <div className={s.quotationSummaryBalance}>
                  <span>Saldo</span>
                  <span>{\`$\${calcQuotation().balance.toLocaleString()}\`}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Historial de cambios"
        size="md"
        footer={
          <div className={s.formActions}>
            <Button variant="secondary" onClick={() => setHistoryOpen(false)}>Cerrar</Button>
            <Button onClick={() => {
              const csv = \`Fecha,Acción,Estado anterior,Estado nuevo,Razón\n\${history.map(h => \`\${new Date(h.fecha).toLocaleString()},\${h.accion},\${h.estadoAnterior ?? ''},\${h.estadoNuevo ?? ''},\${h.razon ?? ''}\`).join('\n')}\`;
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = \`historial-\${selectedOrder?.numeroSolicitud ?? 'solicitud'}.csv\`;
              a.click();
              URL.revokeObjectURL(url);
            }}>Exportar CSV</Button>
          </div>
        }
      >
        <div className={s.form}>
          {history.length ? (
            <div className={s.negotiationHistory}>
              {history.map((h) => (
                <div key={h.id} className={s.negotiationEntry}>
                  <div className={s.negotiationDate}>{new Date(h.fecha).toLocaleString()}</div>
                  <div><strong>{h.accion}</strong></div>
                  <div>{h.estadoAnterior ?? '—'} → {h.estadoNuevo ?? '—'}</div>
                  {h.razon && <div>{h.razon}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className={s.emptyRow}>Sin registros</p>
          )}
        </div>
      </Modal>

      <CustomOrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Editar pedido personalizado' : 'Nuevo pedido personalizado'}
        step={wizardStep}
        onStepChange={setWizardStep}
        onBack={handleBack}
        onSubmit={handleSubmit}
        saving={saving}
      >
        {/* wizard content handled inside CustomOrderFormModal */}
      </CustomOrderFormModal>

      <Modal
        open={!!paymentConfirm}
        onClose={() => setPaymentConfirm(null)}
        title="Confirmar anticipo"
        description="Verifica el comprobante antes de confirmar el pago."
        size="sm"
        footer={
          <ModalFooter
            align="end"
            actions={[
              { label: 'Cancelar', variant: 'secondary', onClick: () => setPaymentConfirm(null) },
              { label: 'Confirmar', variant: 'success', onClick: handleConfirmPayment },
            ]}
          />
        }
      >
        {paymentConfirm && (
          <div className={s.form}>
            <div className={s.sectionBlock}>
              <h3 className={s.sectionTitle}>Solicitud</h3>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Número</span>
                <span className={s.infoValue}>{paymentConfirm.numeroSolicitud}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Cliente</span>
                <span className={s.infoValue}>{paymentConfirm.clienteNombre}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>Comprobante</span>
                <span className={s.infoValue}>
                  {paymentConfirm.paymentProofUrl ? <a className={s.fileLink} href={paymentConfirm.paymentProofUrl} target="_blank" rel="noreferrer">Ver comprobante</a> : 'Sin comprobante'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Eliminar solicitud"
        description={\`¿Estás seguro de eliminar la solicitud \${deleteConfirm?.numeroSolicitud ?? ''}? Esta acción no se puede deshacer.\`}
        size="sm"
        variant="premium"
        footer={
          <ModalFooter
            align="end"
            actions={[
              { label: 'Cancelar', variant: 'secondary', onClick: () => setDeleteConfirm(null), disabled: deleting },
              { label: deleting ? 'Eliminando...' : 'Eliminar', variant: 'danger', onClick: handleDelete, disabled: deleting, leftIcon: <Trash2 size={14} /> },
            ]}
          />
        }
      >
        <div />
      </Modal>
    </div>
  );
`;

const newContent = before + newJSX + after;
fs.writeFileSync(filePath, newContent);
console.log('JSX replaced successfully');
