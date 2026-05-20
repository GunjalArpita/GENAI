import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials:true    
});

// Add token to Authorization header if it exists in localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export async function register({username,email,password}){
   try{
    const response = await api.post("/api/auth/register",{
        username,
        email,
        password
    },
{
    withCredentials:true
});

    if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
}
catch(error){
    console.log(error);
    throw error;
}
}

export async function login({email,password}){
    try{

        const response = await api.post("/api/auth/login",{
            email,
            password    
        },
        {
            withCredentials:true
        }
        );
        
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}


export async function logout()
{
    try{

        const response = await api.get("/api/auth/logout",{
            withCredentials:true
        }
        );
        localStorage.removeItem('authToken');
        return response.data;

    }
    catch(error){
        console.log(error);
    }
}

export async function getMe()
{
try{
    const response = await api.get("/api/auth/get-me",{
        withCredentials:true
    }
    );
    return response.data;   

}
catch(error){
    throw error;
    console.log(error);
}
}