import { useEffect, useState } from "react"
import CustomerLayout from "../../components/CustomerLayout"
import api from "../../api/axios"

export const Tickets = () => {

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        const fetchTickets = async () => {

            try {
                const res = await api.get("/my-support-tickets")
                setTickets(res.data)

            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }

        }

        fetchTickets()

    }, [])


    if (loading) {
        return (
            <CustomerLayout>
                <p className="text-gray-500">
                    Loading tickets...
                </p>
            </CustomerLayout>
        )
    }


    return (
        <CustomerLayout>

            <h1 className="text-2xl font-bold mb-6">
                My Support Tickets
            </h1>


            {
                tickets.length === 0 ? (

                    <div className="bg-white shadow rounded-lg p-6">
                        <p className="text-gray-500">
                            You have not created any support tickets yet.
                        </p>
                    </div>

                ) : (

                    <div className="space-y-5">

                        {
                            tickets.map((ticket) => (

                                <div
                                    key={ticket.ticket_id}
                                    className="bg-white shadow rounded-lg p-6"
                                >

                                    <div className="flex justify-between items-start">

                                        <div>
                                            <h2 className="text-lg font-bold">
                                                {ticket.subject}
                                            </h2>

                                            <p className="text-gray-600 mt-2">
                                                {ticket.body}
                                            </p>
                                        </div>


                                        <span
                                            className={`
                                                px-3 py-1 rounded-full text-sm
                                                ${
                                                    ticket.status === "resolved"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }
                                            `}
                                        >
                                            {ticket.status}
                                        </span>

                                    </div>


                                    <div className="mt-4 text-sm text-gray-400">
                                        Created:
                                        {" "}
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </div>


                                </div>

                            ))
                        }

                    </div>

                )
            }

        </CustomerLayout>
    )
}