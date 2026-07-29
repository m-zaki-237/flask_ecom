import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";

const SellerOrders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const fetchOrders = async (currentPage = 1) => {

    try {

      const res = await api.get(
        `/seller/orders?page=${currentPage}&limit=10`
      );

      setOrders(res.data.orders);
      setTotalPages(res.data.pages);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchOrders(page);

  }, [page]);



  const updateStatus = async (order_id, status) => {

    try {

      await api.patch(`/orders/${order_id}`, {
        status
      });

      fetchOrders(page);

    } catch(err) {

      console.error(err);

    }

  };



  if (loading) {

    return (
      <SellerLayout>
        <p className="text-gray-500">
          Loading...
        </p>
      </SellerLayout>
    );

  }



  return (

    <SellerLayout>

      <h1 className="text-2xl font-bold mb-6">
        Orders
      </h1>


      <div className="bg-white rounded-lg shadow overflow-hidden">

        <table className="w-full text-sm">


          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">

            <tr>

              <th className="px-6 py-3 text-left">
                Order ID
              </th>


              <th className="px-6 py-3 text-left">
                Customer
              </th>


              <th className="px-6 py-3 text-left">
                Product
              </th>


              <th className="px-6 py-3 text-left">
                Quantity
              </th>


              <th className="px-6 py-3 text-left">
                Status
              </th>


              <th className="px-6 py-3 text-left">
                Date
              </th>


              <th className="px-6 py-3 text-left">
                Actions
              </th>


            </tr>

          </thead>



          <tbody className="divide-y">


          {
            orders.length === 0 ?

            (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500"
                >
                  No orders found
                </td>

              </tr>

            )

            :

            orders.map(order => (

              <tr 
                key={order.order_id}
                className="hover:bg-gray-50"
              >


                <td className="px-6 py-4">
                  {order.order_id}
                </td>


                <td className="px-6 py-4">
                  {order.customer_name || "N/A"}
                </td>


                <td className="px-6 py-4">
                  {order.product_name || "N/A"}
                </td>


                <td className="px-6 py-4">
                  {order.quantity}
                </td>



                <td className="px-6 py-4">

                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-600">

                    {order.status}

                  </span>

                </td>



                <td className="px-6 py-4">

                  {order.created_at}

                </td>



                <td className="px-6 py-4">


                  <select

                    value={order.status}

                    onChange={(e)=>
                      updateStatus(
                        order.order_id,
                        e.target.value
                      )
                    }

                    className="border rounded px-2 py-1 text-sm"

                  >

                    <option value="pending">
                      Pending
                    </option>


                    <option value="processing">
                      Processing
                    </option>


                    <option value="shipped">
                      Shipped
                    </option>


                    <option value="delivered">
                      Delivered
                    </option>


                    <option value="cancelled">
                      Cancelled
                    </option>


                  </select>


                </td>


              </tr>

            ))

          }


          </tbody>


        </table>


      </div>



      {/* Pagination */}

      <div className="flex justify-center gap-3 mt-6">


        <button

          disabled={page === 1}

          onClick={() =>
            setPage(p => Math.max(1,p-1))
          }

          className="px-4 py-2 border rounded disabled:opacity-50"

        >

          Previous

        </button>



        <span className="px-4 py-2">

          Page {page} of {totalPages}

        </span>




        <button

          disabled={page === totalPages}

          onClick={() =>
            setPage(p => Math.min(totalPages,p+1))
          }

          className="px-4 py-2 border rounded disabled:opacity-50"

        >

          Next

        </button>



      </div>


    </SellerLayout>

  );

};


export default SellerOrders;