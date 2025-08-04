import echo from './echo';

export function listenToCellsInformationEvents(
  onCellInfoChanged: (cellInfo: any) => void,
  onCellInfoDeleted?: (cellId: string) => void
) {
  const channel = echo.channel('cells-information');
  channel.listen('.CellsInformationCreated', (e: { cellInfo: any }) => {
    onCellInfoChanged(e.cellInfo);
  });
  channel.listen('.CellsInformationUpdated', (e: { cellInfo: any }) => {
    onCellInfoChanged(e.cellInfo);
  });
  if (onCellInfoDeleted) {
    channel.listen('.CellsInformationDeleted', (e: { cell_id: string }) => {
      onCellInfoDeleted(e.cell_id);
    });
  }
  return () => {
    channel.stopListening('.CellsInformationCreated');
    channel.stopListening('.CellsInformationUpdated');
    if (onCellInfoDeleted) {
      channel.stopListening('.CellsInformationDeleted');
    }
  };
}
