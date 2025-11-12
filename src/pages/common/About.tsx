const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-4">About Us</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Welcome to <strong>DenaSetu</strong> — a bridge between kindness and
          need. We’re a platform dedicated to connecting donors, NGOs, and
          volunteers to create meaningful community impact through transparent
          and direct giving.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Our mission is to make donations more personal, more visible, and
          more effective. Whether you’re an NGO looking for support, a donor
          seeking trustworthy causes, or a volunteer ready to help, DenaSetu
          brings everyone together in one trusted space.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Together, we aim to empower communities and make generosity
          effortless.
        </p>
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the DenaSetu team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
