import { createContext, useContext, useState } from "react";

const AuthContext = createContext()

export const AuthProvidor = ({children}) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    const login = (userData, accessToken) => {
        setUser(userData)
        setToken(accessToken)
        localStorage.setItem("token", accessToken)
        localStorage.setItem("user", JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    } 

    const isAuthenticated = () => !!token

    return (
        <AuthContext.Provider value={{user,token,login,logout,isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}