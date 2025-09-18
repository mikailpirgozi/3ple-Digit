import {
  AlertCircle,
  Archive,
  BarChart3,
  Briefcase,
  Building2,
  Car,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Home,
  Home as House,
  Image,
  Info,
  LineChart,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Paperclip,
  Phone,
  PieChart,
  Plus,
  Search,
  Settings,
  TrendingUp as Stock,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';

// Navigation Icons
export const NavigationIcons = {
  dashboard: BarChart3,
  investors: Users,
  assets: Building2,
  bank: CreditCard,
  liabilities: CreditCard,
  snapshots: TrendingUp,
  documents: FileText,
  reports: PieChart,
  home: Home,
} as const;

// Action Icons
export const ActionIcons = {
  add: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  upload: Upload,
  download: Download,
  search: Search,
  filter: Filter,
  menu: Menu,
  close: X,
  settings: Settings,
  logout: LogOut,
} as const;

// Status Icons
export const StatusIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
} as const;

// Theme Icons
export const ThemeIcons = {
  light: Sun,
  dark: Moon,
} as const;

// File Type Icons
export const FileTypeIcons = {
  pdf: FileText,
  image: Image,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  archive: Archive,
  default: Paperclip,
} as const;

// Asset Type Icons
export const AssetTypeIcons = {
  PÔŽIČKY: DollarSign,
  NEHNUTEĽNOSTI: House,
  AUTÁ: Car,
  AKCIE: Stock,
  MATERIÁL: Wrench,
  'PODIEL VO FIRME': Briefcase,
} as const;

// Chart Icons
export const ChartIcons = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  area: TrendingUp,
} as const;

// Direction Icons
export const DirectionIcons = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
} as const;

// User Icons
export const UserIcons = {
  user: User,
  mail: Mail,
  phone: Phone,
  location: MapPin,
} as const;

// Utility function to get icon by type
export function getFileIcon(mimeType: string | null | undefined) {
  if (!mimeType) return FileTypeIcons.default;

  const type = mimeType.toLowerCase();
  if (type.includes('pdf')) return FileTypeIcons.pdf;
  if (type.includes('image')) return FileTypeIcons.image;
  if (type.includes('word') || type.includes('document')) return FileTypeIcons.document;
  if (type.includes('excel') || type.includes('spreadsheet')) return FileTypeIcons.spreadsheet;
  if (type.includes('zip') || type.includes('rar')) return FileTypeIcons.archive;

  return FileTypeIcons.default;
}

// Utility function to get asset type icon
export function getAssetTypeIcon(type: string) {
  return AssetTypeIcons[type as keyof typeof AssetTypeIcons] || Building2;
}
