import React, { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import CallConnect from "./CallConnect";
import "./VideoCall.css";

const CallProvider = ({ meetingId, meetingName, onClose }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        console.log("Initializing Stream Video client...");

        // Get user info from sessionStorage (new secure storage)
        const learnerToken = sessionStorage.getItem("learnerToken");
        const adminToken = sessionStorage.getItem("adminToken");
        const teacherToken = sessionStorage.getItem("teacherToken");
        const userStr =
          sessionStorage.getItem("user") || localStorage.getItem("learnerUser");

        console.log("SessionStorage check:", {
          hasLearnerToken: !!learnerToken,
          hasAdminToken: !!adminToken,
          hasTeacherToken: !!teacherToken,
          hasUser: !!userStr,
          userStr: userStr?.substring(0, 100),
        });

        const user = userStr ? JSON.parse(userStr) : null;

        console.log("User from sessionStorage:", user);

        if (!user) {
          const errorMsg =
            "No user found in sessionStorage. Please login first.";
          console.error(errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        // Generate token from backend
        const apiUrl = `${process.env.REACT_APP_API_URL}/stream/generate-token`;
        console.log("Fetching token from:", apiUrl);

        const authToken =
          sessionStorage.getItem("learnerToken") ||
          sessionStorage.getItem("adminToken") ||
          sessionStorage.getItem("teacherToken");

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ userId: user._id || user.id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate token: ${response.status}`);
        }

        const data = await response.json();
        console.log("Token response:", data);
        const { token } = data;

        // Initialize Stream Video client
        const apiKey =
          process.env.REACT_APP_STREAM_VIDEO_API_KEY || "dq4ynucsge5k";
        console.log("Initializing StreamVideoClient with API key:", apiKey);

        const streamVideoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: String(user._id || user.id),
            name: user.name || user.username || "User",
            image:
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || user.username || "User"
              )}`,
          },
          token,
        });

        console.log("StreamVideoClient initialized successfully");
        setClient(streamVideoClient);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Stream Video client:", error);
        setError(error.message || "Unknown error occurred");
        setIsLoading(false);
      }
    };

    initializeClient();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
        }}
      >
        <div className="text-center text-white">
          <Loader2 className="mb-3 animate-spin" size={48} />
          <p>Initializing video call...</p>
        </div>
      </div>
    );
  }

  if (!client && !isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
        }}
      >
        <div className="card shadow-lg" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-4">
            <h5 className="text-danger mb-3">
              ❌ Failed to initialize video call
            </h5>
            {error && (
              <div className="alert alert-danger text-start mb-3">
                <small>
                  <strong>Error:</strong> {error}
                </small>
              </div>
            )}
            <p className="text-muted small mb-3">Possible issues:</p>
            <ul className="text-start text-muted small mb-3">
              <li>Backend server not running (port 5000)</li>
              <li>Not logged in (check localStorage)</li>
              <li>Network connection issues</li>
              <li>Stream API keys not configured</li>
            </ul>
            <button onClick={onClose} className="btn btn-primary">
              Close and Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <CallConnect
        meetingId={meetingId}
        meetingName={meetingName}
        client={client}
        onClose={onClose}
      />
    </StreamVideo>
  );
};

export default CallProvider;
