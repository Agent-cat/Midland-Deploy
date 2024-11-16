import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  User,
  Home,
  Search,
  Building,
  Users,
  UserCog,
  X,
  AlertTriangle,
  Check,
  MessageSquare,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";

const AdminPanel = ({ properties, refreshProperties }) => {
  const url = "https://midland-deploy.onrender.com";
  const [activeTab, setActiveTab] = useState("properties");
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.post(`${url}/api/auth/users`);
      const allUsers = response.data;
      setUsers(allUsers.filter((user) => user.role === "client"));
      setAgents(allUsers.filter((user) => user.role === "agent"));
    } catch (error) {
      showToast("Error fetching users");
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${url}/api/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`${url}/api/properties/${propertyToDelete._id}`);
      refreshProperties();
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      showToast("Property deleted successfully!", "success");
    } catch (error) {
      showToast("Error deleting property");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (contactId, newStatus) => {
    try {
      await axios.put(`${url}/api/contacts/${contactId}`, {
        status: newStatus,
      });
      fetchContacts();
      showToast("Status updated successfully!", "success");
    } catch (error) {
      showToast("Error updating contact status");
    }
  };

  const filteredData = () => {
    const searchLower = searchTerm.toLowerCase();
    switch (activeTab) {
      case "properties":
        return properties.filter(
          (property) =>
            property.name.toLowerCase().includes(searchLower) ||
            property.location.toLowerCase().includes(searchLower)
        );
      case "users":
        return users.filter(
          (user) =>
            user.username.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      case "agents":
        return agents.filter(
          (agent) =>
            agent.username.toLowerCase().includes(searchLower) ||
            agent.email.toLowerCase().includes(searchLower)
        );
      default:
        return [];
    }
  };

  const tabs = [
    { id: "properties", label: "Properties", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "agents", label: "Agents", icon: UserCog },
    { id: "contacts", label: "Contacts", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-4xl text-center font-bold text-red-500 mb-6">
            Admin Dashboard
          </h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-red-500 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg">
            {activeTab === "properties" && (
              <div className="flex flex-wrap gap-4">
                {filteredData().map((property) => (
                  <div
                    key={property._id}
                    className="flex-shrink-0 w-64 border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-32">
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteClick(property)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300 shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {property.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{property.location}</p>
                      <p className="text-red-500 font-bold">
                        ₹{property.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === "users" || activeTab === "agents") && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData().map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className="border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {user.username}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                        <span className="inline-block px-3 py-1 mt-2 text-xs font-medium rounded-full bg-red-100 text-red-600">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="space-y-4">
                {filteredData().map((contact) => (
                  <div
                    key={contact._id}
                    className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {contact.propertyId.name}
                        </h3>
                        <p className="text-gray-600 mb-1">
                          From: {contact.name}
                        </p>
                        <p className="text-gray-600 mb-1">
                          Email: {contact.email}
                        </p>
                        <p className="text-gray-600 mb-1">
                          Phone: {contact.phone}
                        </p>
                        <p className="text-gray-600 mb-4">{contact.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            contact.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : contact.status === "contacted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {contact.status}
                        </span>
                        <select
                          value={contact.status}
                          onChange={(e) =>
                            handleStatusUpdate(contact._id, e.target.value)
                          }
                          className="mt-2 px-3 py-1 border rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{propertyToDelete?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture}
                    alt={selectedUser.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-red-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-semibold">
                    {selectedUser.username}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <p className="text-gray-600">Phone: {selectedUser.phno}</p>
                  <span className="inline-block px-3 py-1 mt-2 text-sm font-medium rounded-full bg-red-100 text-red-600">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {selectedUser.role === "agent" && (
                <div>
                  <h4 className="text-xl font-semibold mb-4">
                    Listed Properties
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {properties
                      .filter(
                        (prop) => prop.ownerName === selectedUser.username
                      )
                      .map((property) => (
                        <div
                          key={property._id}
                          className="flex-shrink-0 w-64 border rounded-xl overflow-hidden shadow-md"
                        >
                          <img
                            src={property.images[0]}
                            alt={property.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-4">
                            <p className="font-semibold">{property.name}</p>
                            <p className="text-gray-600 text-sm">
                              {property.location}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
