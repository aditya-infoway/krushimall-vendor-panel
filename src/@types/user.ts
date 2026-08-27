export interface User {
  id: number;
  userId: number;
  vendorType: string;
  vehicleType: string | null;
  isVerified: boolean;
  status: "PENDING" | "ACTIVE";
  name: string;
  email: string;
  number: string;
}