import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { useState } from "react"

export default function CustomerLayout({ children }) {
    const [showTicketModal, setShowTicketModal] = useState(false)
    const [ticket, setTicket] = useState({ subject: "", body: "" })
    const [ticketMessage, setTicketMessage] = useState("")

    const { logout, user } = useAuth()
    const navigate = useNavigate()

    const handleSubmitTicket = async () => {
        try {
            await api.post("/support_tickets", {
                user_id: user.user_id,
                subject: ticket.subject,
                body: ticket.body
            })

            setTicketMessage("Ticket submitted successfully!")
            setTicket({ subject: "", body: "" })

            setTimeout(() => {
                setShowTicketModal(false)
                setTicketMessage("")
            }, 1500)

        } catch (err) {
            setTicketMessage("Failed to submit ticket")
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-gray-100">

            <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">

    <Link 
        to="/home" 
        className="text-xl font-bold text-blue-600"
    >
        Shop
    </Link>


    <div className="flex gap-6 items-center">

        <Link 
            to="/home" 
            className="text-sm hover:text-blue-600"
        >
            Home
        </Link>


        <Link 
            to="/cart" 
            className="text-sm hover:text-blue-600"
        >
            Cart
        </Link>


        <Link 
            to="/orders" 
            className="text-sm hover:text-blue-600"
        >
            Orders
        </Link>


        <Link 
            to="/wishlist" 
            className="text-sm hover:text-blue-600"
        >
            Wishlist
        </Link>


        <Link 
            to="/support_tickets" 
            className="text-sm hover:text-blue-600"
        >
            Support
        </Link>


        <span className="text-sm text-gray-500">
            Hi, {user?.first_name}
        </span>


        <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
            Logout
        </button>

    </div>

</nav>


            <main className="max-w-6xl mx-auto py-8 px-4">
                {children}
            </main>


            {/* Floating Support Button */}
            <button
                onClick={() => setShowTicketModal(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 text-sm z-40"
            >
                💬 Support
            </button>


            {/* Support Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg p-6 w-full max-w-md">

                        <h2 className="text-lg font-bold mb-4">
                            Contact Support
                        </h2>


                        {ticketMessage ? (
                            <p className="text-green-600 text-center py-4">
                                {ticketMessage}
                            </p>
                        ) : (

                            <div className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Subject
                                    </label>

                                    <input
                                        type="text"
                                        value={ticket.subject}
                                        onChange={(e) =>
                                            setTicket({
                                                ...ticket,
                                                subject: e.target.value
                                            })
                                        }
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        placeholder="What's the issue?"
                                    />
                                </div>


                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Description
                                    </label>

                                    <textarea
                                        value={ticket.body}
                                        onChange={(e) =>
                                            setTicket({
                                                ...ticket,
                                                body: e.target.value
                                            })
                                        }
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        rows={4}
                                        placeholder="Describe your issue..."
                                    />
                                </div>


                                <div className="flex gap-3">

                                    <button
                                        onClick={() => setShowTicketModal(false)}
                                        className="flex-1 border py-2 rounded text-sm"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        onClick={handleSubmitTicket}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded text-sm"
                                    >
                                        Submit
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    )
}