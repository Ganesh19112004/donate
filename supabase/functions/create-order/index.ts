
// Razorpay Order Creation using Deno (NO SDK)

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const keyId = Deno.env.get("rzp_test_SlNseXTPU2ceUA")!;
    const keySecret = Deno.env.get("O85eOgGPm1XEzE5g5kj7tP5T")!;

    const credentials = btoa(`${keyId}:${keySecret}`);

    // Create order from Razorpay REST API
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: body.amount * 100,
        currency: "INR",
        receipt: `campaign_${body.campaign_id}_${Date.now()}`,
        payment_capture: 1,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
