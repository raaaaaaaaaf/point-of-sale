import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db, provider } from 'src/firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
// ----------------------------------------------------------------------

export default function RegisterView() {
  const theme = useTheme();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [regEmail, setEmail] = useState("");
  const [regPassword, setPassword] = useState("");

  const handleClick = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, regEmail, regPassword)
      await updateProfile(res.user, {
        displayName: name,
      });
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName: name,
        email: regEmail,
        password: regPassword,
        role: "User",
      })
      toast.success("Registered Successfully.", {
        position: "top-right",
        autoClose: 3000, // Automatically close the toast after 3 seconds
        hideProgressBar: false,
      });
      router.push('/app')
    } catch(err) {
      console.error(err);
    }
    
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider)
      const user = auth.currentUser;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayname: user.displayName,
        email: user.email,
        role: "User"
      })
      toast.success("Login Successfully.", {
        position: "top-right",
        autoClose: 3000, // Automatically close the toast after 3 seconds
        hideProgressBar: false,
      });
      router.push('/app')
    } catch(err) {
      toast.error("Something went wrong!.", {
        position: "top-right",
        autoClose: 3000, // Automatically close the toast after 3 seconds
        hideProgressBar: false,
      });
      console.error(err);
    }
  }

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField name="fname" label="Full Name" onChange={(e) => setName(e.target.value)}/>
        <TextField name="email" label="Email address" onChange={(e) => setEmail(e.target.value)}/>

        <TextField
          name="password"
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>


      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleClick}
        style={{ marginTop: '20px' }}
      >
        Sign Up
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Sign in to NDWBIS</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Already have an account?
            <Link onClick={() => router.push('/login')} variant="subtitle2" sx={{ ml: 0.5 }}>
              Sign In
            </Link>
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              onClick={signInWithGoogle}
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:google-fill" color="#DF3E30" />
            </Button>

            {/* <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:facebook-fill" color="#1877F2" />
            </Button> */}

            {/* <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:twitter-fill" color="#1C9CEA" />
            </Button> */}
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
