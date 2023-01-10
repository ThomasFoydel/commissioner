import { ToastContainer } from 'react-toastify'
export default function Layout({ children }) {
  return (
    <div className="crt">
      <ToastContainer position="bottom-right" />
      <div className="pixels" />
      {children}
    </div>
  )
}
