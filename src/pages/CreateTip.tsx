import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TipForm from '@/components/TipForm';
import { useAuthStore } from '@/stores';

const CreateTip: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    navigate('/tips');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <TipForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateTip;