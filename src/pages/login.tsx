import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@example.com", // Pre-filled for development
    password: "password123",     // Pre-filled for development
    rememberMe: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Development mode auto-login
  const isDevelopment = true; // Would be environment-based in production

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // In development mode, simulate successful login
    if (isDevelopment) {
      setTimeout(() => {
        toast({
          title: "Development Mode",
          description: "You have been signed in as admin in development mode.",
        });
        navigate("/admin");
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const { data, error } = await fine.auth.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
          rememberMe: formData.rememberMe,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            toast({
              title: "Success",
              description: "You have been signed in successfully.",
            });
            navigate("/");
          },
          onError: (ctx) => {
            toast({
              title: "Error",
              description: ctx.error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!fine) return <Navigate to='/' />;
  
  // Skip actual auth check in development mode
  if (!isDevelopment) {
    const { isPending, data } = fine.auth.useSession();
    if (!isPending && data) return <Navigate to='/' />;
  }

  return (
    <div className='container mx-auto flex h-screen items-center justify-center py-10'>
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        
        {isDevelopment && (
          <CardContent className="pt-0 pb-4">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <strong>Development Mode:</strong> Click "Sign in" to access the admin area without authentication.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='john@example.com'
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className='text-sm text-destructive'>{errors.email}</p>}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link to='/forgot-password' className='text-sm text-primary underline-offset-4 hover:underline'>
                  Forgot password?
                </Link>
              </div>
              <Input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className='text-sm text-destructive'>{errors.password}</p>}
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox id='rememberMe' checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor='rememberMe' className='text-sm font-normal'>
                Remember me
              </Label>
            </div>
          </CardContent>

          <CardFooter className='flex flex-col space-y-4'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <p className='text-center text-sm text-muted-foreground'>
              Don't have an account?{" "}
              <Link to='/signup' className='text-primary underline underline-offset-4 hover:text-primary/90'>
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}