import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";


const SellerPayments = () => {

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);



  const fetchPayments = async (currentPage = 1) => {

    try {

      const res = await api.get(
        `/seller/payments?page=${currentPage}&limit=10`
      );


      setPayments(res.data.payments || []);

      setTotalPages(res.data.pages || 1);


    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchPayments(page);

  }, [page]);





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
        Payments
      </h1>




      <div className="bg-white rounded-lg shadow overflow-hidden">


        <table className="w-full text-sm">


          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">


            <tr>


              <th className="px-6 py-3 text-left">
                Payment ID
              </th>



              <th className="px-6 py-3 text-left">
                Order ID
              </th>



              <th className="px-6 py-3 text-left">
                Amount
              </th>



              <th className="px-6 py-3 text-left">
                Payment Method
              </th>



              <th className="px-6 py-3 text-left">
                Status
              </th>



            </tr>


          </thead>





          <tbody className="divide-y divide-gray-100">


            {
              payments.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500"
                  >

                    No payments found

                  </td>

                </tr>


              ) : (


                payments.map((payment) => (


                  <tr
                    key={payment.payment_id}
                    className="hover:bg-gray-50"
                  >



                    <td className="px-6 py-4">

                      {payment.payment_id}

                    </td>




                    <td className="px-6 py-4">

                      {payment.order_id}

                    </td>





                    <td className="px-6 py-4">

                      ${payment.amount}

                    </td>





                    <td className="px-6 py-4">

                      {payment.payment_method}

                    </td>





                    <td className="px-6 py-4">


                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          payment.payment_status === "completed"
                            ? "bg-green-100 text-green-600"
                            : payment.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >

                        {payment.payment_status}

                      </span>


                    </td>





                  </tr>


                ))

              )

            }



          </tbody>


        </table>


      </div>





      <div className="flex justify-center items-center gap-3 mt-6">



        <button

          onClick={() =>
            setPage((p) => Math.max(1, p - 1))
          }

          disabled={page === 1}

          className="px-4 py-2 bg-white border rounded text-sm disabled:opacity-50"

        >

          Previous

        </button>





        <span className="px-4 py-2 text-sm">

          Page {page} of {totalPages}

        </span>





        <button

          onClick={() =>
            setPage((p) => Math.min(totalPages, p + 1))
          }

          disabled={page === totalPages}

          className="px-4 py-2 bg-white border rounded text-sm disabled:opacity-50"

        >

          Next

        </button>




      </div>



    </SellerLayout>

  );

};


export default SellerPayments;