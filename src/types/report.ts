export interface Report {
  id: string;
  user_id: string;
  username: string;
  report_code: string;
  report_date: string;
  team: string | null;
  installer_1: string | null;
  installer_2: string | null;
  installer_3: string | null;
  installer_4: string | null;
  // Installation section
  install_address: string | null;
  install_payment_method: string | null;
  install_amount: number;
  install_notes: string | null;
  install_material_open: number;
  install_material_replenish: number;
  measure_colleague: string | null;
  install_doors: number;
  install_windows: number;
  install_aluminum: number;
  install_old_removed: number;
  // Order section
  order_address: string | null;
  order_payment_method: string | null;
  order_amount: number;
  order_data_type: string | null;
  order_material_open: number;
  order_material_replenish: number;
  order_reorder: number;
  order_measure_colleague: string | null;
  order_reorder_location: string | null;
  order_notes: string | null;
  responsibility_option: string | null;
  urgency: string | null;
  install_difficulty: string | null;
  order_install_doors: number;
  order_install_windows: number;
  order_install_aluminum: number;
  order_old_removed: number;
  created_at: string;
  updated_at: string;
}

export interface ReportFormData {
  report_date: string;
  team: string;
  installer_1: string;
  installer_2: string;
  installer_3: string;
  installer_4: string;
  // Installation section
  install_address: string;
  install_payment_method: string;
  install_amount: number;
  install_notes: string;
  install_material_open: number;
  install_material_replenish: number;
  measure_colleague: string;
  install_doors: number;
  install_windows: number;
  install_aluminum: number;
  install_old_removed: number;
  // Order section
  order_address: string;
  order_payment_method: string;
  order_amount: number;
  order_data_type: string;
  order_material_open: number;
  order_material_replenish: number;
  order_reorder: number;
  order_measure_colleague: string;
  order_reorder_location: string;
  order_notes: string;
  responsibility_option: string;
  urgency: string;
  install_difficulty: string;
  order_install_doors: number;
  order_install_windows: number;
  order_install_aluminum: number;
  order_old_removed: number;
}

export const PAYMENT_METHODS = ['FPS', 'WeChat', 'Alipay', '現金', '支票'];
export const DATA_TYPES = ['NewData', 'OldData'];
export const RESPONSIBILITY_OPTIONS = ['NONE', 'FactoryResponsible', 'InstallerResponsible'];
export const URGENCY_OPTIONS = ['Normal', 'Urgent'];
export const TEAMS = ['A', 'B', 'C', 'D', 'E', 'S', 'Z'];
export const COLLEAGUES = [
  '羅慶文', '張均全', '黃雪松', '張文浩', '黃禮然',
  '何家俊', '洪旭東', '黃榮基', '張佩樺'
];
