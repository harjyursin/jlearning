const axios = require("axios");

exports.createPayment = async (req, res) => {
  const { amount, phone, orderId } = req.body;

  try {
    const response = await axios.post(
      "https://pre-api.mvola.mg/mvola/mm/transactions/type/merchantpay/1.0.0",
      {
        amount,
        customerPhone: phone,
        reference: orderId
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MVOLA_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.render("pending"); // page attente confirmation
  } catch (error) {
    res.send("Erreur paiement");
  }
};

exports.handleCallback = async (req, res) => {
  const { status, reference } = req.body;

  if (status === "SUCCESS") {
    // mettre commande comme PAYÉ en base
    console.log("Commande payée :", reference);
  }

  res.sendStatus(200);
};