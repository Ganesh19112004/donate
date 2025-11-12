const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Terms & Conditions
        </h1>

        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome to <strong>DenaSetu</strong>. By using our website and
          services, you agree to the following terms and conditions. Please read
          them carefully.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          1. General Information
        </h2>
        <p className="text-gray-700 mb-4">
          DenaSetu is a platform that connects donors, NGOs, and volunteers to
          promote charitable and community-driven activities. We do not directly
          handle or guarantee transactions between users and organizations.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. User Responsibilities
        </h2>
        <p className="text-gray-700 mb-4">
          Users must provide accurate information when registering and using our
          services. Misuse of the platform for fraudulent activities may result
          in suspension or legal action.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Donations and Refund Policy
        </h2>
        <p className="text-gray-700 mb-4">
          Donations made through this platform are voluntary and non-refundable.
          DenaSetu is not responsible for the use or management of donated
          funds by NGOs.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          4. Privacy and Data
        </h2>
        <p className="text-gray-700 mb-4">
          We respect your privacy. Your personal data will only be used for
          communication and verification purposes as outlined in our Privacy
          Policy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes</h2>
        <p className="text-gray-700 mb-4">
          These terms may be updated periodically. Continued use of the platform
          implies your acceptance of the latest version.
        </p>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Last Updated: November 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
