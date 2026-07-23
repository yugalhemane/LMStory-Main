import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../../../store/theme.store';


export function AuthLayout() {
  const { theme } = useThemeStore();
  
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-8 bg-background ${theme}`}>
      {/* White-label Background Element (Full Screen) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="w-full h-full object-cover opacity-20 filter blur-sm bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnMn7iOeWl8WH91ITSQDd9ypPMOLoP_6nBfvnXU6mtOw4WKhlSQ4qrOKK-vQY7QPUkM0tSEtDiImUpEXydeuBQFRJl9WujvAdSiCAAutn1E7W4Yjz3a1r3JSevNtUc8V1yBb1Kg8KE5Y-SMvA06RPG4WkwCc6iGVBPsdIArDxAeWh3eOzdDsMP8SNywlq0GoQgocZdcHUUzpGTaIgXgF3AtaJeLJMtdyQ5ZXDZ8nbCn42yoK2RLGMII9nRsJyZc3pMNs8Fi9eAd6Rr')" }}
        />
      </div>
      
      <Outlet />
    </div>
  );
}
