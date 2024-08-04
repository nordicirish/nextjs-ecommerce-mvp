import { Nav, NavLink } from "@/components/nav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Nav>
      <NavLink href="/admin">Dasboard</NavLink>
      <NavLink href="/admin/products">Products</NavLink>
      <NavLink href="/admin/users">Users</NavLink>
      <NavLink href="/admin/orders">Sales</NavLink>
    </Nav>
  );
}
