export interface DeleteResult {
  id: number;
  deleteType: 'physical' | 'soft';
  message: string;
}
