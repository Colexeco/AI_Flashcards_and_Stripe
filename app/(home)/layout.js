import Navbar, { HomeRightContent } from "../components/Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar rightContent={<HomeRightContent />} />
      {children}
    </div>
  );
}
