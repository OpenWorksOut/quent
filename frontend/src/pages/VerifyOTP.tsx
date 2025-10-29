import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || "";
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const { completeAuth } = useAuth();

  useEffect(() => {
    try {
      const exp = sessionStorage.getItem(`otp_expires:${email}`);
      setExpiresAt(exp ? parseInt(exp, 10) : null);
    } catch (err) {
      setExpiresAt(null);
    }
  }, [email]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("No email provided. Please go back to signup or login.");
      navigate("/login");
      return;
    }

    api
      .verifyOtp({ email, code })
      .then((res: any) => {
        toast.success("OTP verified — welcome!");
        // store token and user in auth context
        if (res.token && res.user) {
          completeAuth(res.token, res.user);
        }
        navigate("/dashboard");
      })
      .catch((err: any) => {
        toast.error(err.message || "Verification failed. Try again.");
      });
  };

  const resend = () => {
    if (!email) {
      toast.error("No email available to resend OTP.");
      return;
    }
    api
      .resendOtp({ email })
      .then(() => {
        toast("A new OTP has been sent to your email.");
      })
      .catch(() => toast.error("Could not resend OTP."));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Verify OTP</h2>
          <p className="text-muted-foreground">
            Enter the 6-digit code we sent to {email || "your email"}.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="otp">One-time code</Label>
              <Input
                id="otp"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                required
              />
              {expiresAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expires in{" "}
                  {Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))}s
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" className="flex-1">
                Verify
              </Button>
              <Button variant="outline" type="button" onClick={resend}>
                Resend
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Not you?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
