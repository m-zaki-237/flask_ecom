import SellerSidebar from "./SellerSidebar"

const SellerLayout = ({children}) => {
  return (
    <div className="flex">
        <SellerSidebar/>
        <main className="flex-1 p-8 bg-gray-100 min-h-screen">
            {children}
        </main>
    </div>
  )
}

export default SellerLayout