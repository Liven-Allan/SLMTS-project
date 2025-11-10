import { Edit, Save, X, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User } from "@/services/api/types";
import { UserStatistics } from "@/services/api/profileService";

interface ProfileProps {
  onBack: () => void;
}

const Profile = ({ onBack }: ProfileProps) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Hooks
  const { user, updateUser } = useAuth();
  const { loading, error, getProfile, updateProfile, getUserStatistics } = useProfile();

  // Load profile data and statistics on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        // Load profile
        const profile = await getProfile();
        if (profile) {
          setProfileData(profile);
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
          });
        }

        // Load statistics
        const stats = await getUserStatistics();
        if (stats) {
          setStatistics(stats);
        }
      }
    };
    loadProfileData();
  }, [user?.id, getProfile, getUserStatistics]);

  const handleSaveProfile = async () => {
    const updatedProfile = await updateProfile(formData);
    if (updatedProfile) {
      setProfileData(updatedProfile);
      setIsEditingProfile(false);
      setSuccessMessage("Profile updated successfully!");
      // Update the auth context with new user data
      updateUser(updatedProfile);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
      });
    }
    setIsEditingProfile(false);
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin mr-2" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">Error loading profile: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <Button
          variant={isEditingProfile ? "outline" : "default"}
          onClick={() => isEditingProfile ? handleCancelEdit() : setIsEditingProfile(true)}
          disabled={loading}
        >
          {isEditingProfile ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                disabled={!isEditingProfile}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                disabled={!isEditingProfile}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled={!isEditingProfile}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              disabled={!isEditingProfile}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      {statistics && (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your account activity and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Orders</Label>
                <div className="text-2xl font-bold text-primary">
                  {statistics.total_orders}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Total Spent</Label>
                <div className="text-2xl font-bold text-primary">
                  UGX {statistics.total_spent.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="text-sm text-muted-foreground">
                  {statistics.member_since ? new Date(statistics.member_since).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
            
            {/* Orders by Status */}
            <div className="mt-6">
              <Label className="text-base font-semibold">Orders by Status</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{statistics.orders_by_status.pending}</div>
                  <div className="text-xs text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{statistics.orders_by_status.processing}</div>
                  <div className="text-xs text-blue-700">Processing</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{statistics.orders_by_status.completed}</div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{statistics.orders_by_status.cancelled}</div>
                  <div className="text-xs text-red-700">Cancelled</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isEditingProfile && (
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={handleCancelEdit} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1 bg-gradient-primary" onClick={handleSaveProfile} disabled={loading}>
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;