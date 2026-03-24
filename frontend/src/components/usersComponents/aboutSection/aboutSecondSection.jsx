import { useState, useEffect } from "react";
import axios from "axios";

const roles = ["Manager", "HeadCook", "Supervisor"];

const aboutSecondSection = () => {
  
  const [activeTab, setActiveTab] = useState("Manager");
  const [teamData, setTeamData] = useState({});

  const fetchTeam = async (role) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/voyager/team/${encodeURIComponent(role)}`
      );
      setTeamData((prev) => ({
        ...prev,
        [role]: response.data.team,
      }));
    } catch (error) {
      console.error(`Error fetching ${role} team:`, error);
    }
  };

  useEffect(() => {
    if (!teamData[activeTab]) {
      fetchTeam(activeTab);
    }
  }, [activeTab]);


  return (
    <section className="px-4 sm:px-6 md:px-16 py-16 overflow-x-hidden">
      <div className="rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md border border-white/20">
        <div className="bg-white/10 p-4 sm:p-6 md:p-10 rounded-3xl shadow-xl">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === role
                    ? "bg-white text-[#003860]"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(teamData[activeTab] || []).map((member, idx) => (
              <div
                key={idx}
                className="bg-white/10 p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-center text-center sm:text-left space-x-0 sm:space-x-6"
              >
                <img
                  src={
                    member.image ||
                    "https://cdn-icons-png.flaticon.com/512/9187/9187604.png"
                  }
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover mb-4 sm:mb-0"
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-white/70">{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


export default aboutSecondSection
