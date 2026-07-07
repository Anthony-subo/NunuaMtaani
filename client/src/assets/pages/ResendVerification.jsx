import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ResendVerification() {

    const [email,setEmail]=useState("");
    const [message,setMessage]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);

    const handleSubmit=async(e)=>{

        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try{

            const res=await axios.post(

                `${import.meta.env.VITE_API_URL}/api/auth/resend-verification`,

                {email}

            );

            setMessage(res.data.message);

        }

        catch(err){

            setError(
                err.response?.data?.message ||
                "Something went wrong."
            );

        }

        finally{

            setLoading(false);

        }

    };

    return(

<div className="auth-container">

<h2 className="mb-4">
Resend Verification Email
</h2>

{message &&

<div className="alert alert-success">

{message}

</div>

}

{error &&

<div className="alert alert-danger">

{error}

</div>

}

<form onSubmit={handleSubmit}>

<input

type="email"

placeholder="Enter your email"

className="form-control"

value={email}

onChange={(e)=>setEmail(e.target.value)}

required

/>

<br/>

<button

className="btn btn-primary w-100"

disabled={loading}

>

{loading ? "Sending..." : "Send Verification Email"}

</button>

</form>

<div className="text-center mt-3">

<Link to="/login">

Back to Login

</Link>

</div>

</div>

    );

}

export default ResendVerification;