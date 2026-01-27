import { createContext, useState, useContext } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setUserRole] = useState("user");

  return (
    <RoleContext.Provider value={{ role, setUserRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
export default RoleContext;
