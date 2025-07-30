import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FloatingSupport } from "@/components/floating-support";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { CurrencyProvider } from "./hooks/use-currency";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminUsers from "@/pages/admin-users";
import AdminServices from "@/pages/admin-services";
import AdminSupport from "@/pages/admin-support";
import AdminApiSettings from "@/pages/admin-api-settings";
import AdminProviders from "@/pages/admin-providers";
import AdminPaymentMethods from "@/pages/admin-payment-methods";
import AdminSupportContacts from "@/pages/admin-support-contacts";
import AdminSupportTickets from "@/pages/admin-support-tickets";
import AdminMessages from "@/pages/admin-messages";
import AdminLogoSettings from "@/pages/admin-logo-settings";
import AdminProviderServices from "@/pages/admin-provider-services";
import AdminManualImport from "@/pages/admin/manual-service-import";
import AdminPayments from "@/pages/admin-payments-improved";
import AdminUserMessages from "@/pages/admin-user-messages";
import AdminWhatsAppChat from "@/pages/admin-whatsapp-chat";
import AdminOrders from "@/pages/admin-orders";
import SupportTickets from "@/pages/support-tickets";
import UserAdminMessages from "@/pages/user-admin-messages";
import MessagesWithAdmin from "@/pages/messages-with-admin";
import AdminReferralSettings from "@/pages/admin-referral-settings";
import AdminSettings from "@/pages/admin-settings";

import ServicesMobile from "@/pages/services-mobile";
import AdminServiceVisibility from "@/pages/admin-service-visibility-simple";
import AdminServiceManagement from "@/pages/admin-service-management";
import Services from "@/pages/services";
import MyOrders from "@/pages/my-orders";
import MyOrdersEnhanced from "@/pages/my-orders-enhanced";
import Wallet from "@/pages/wallet";
import Referrals from "@/pages/referrals";
import Checkout from "@/pages/checkout";
import Support from "@/pages/support";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin-users" component={AdminUsers} />
      <Route path="/admin-services" component={AdminServices} />
      <Route path="/admin-support" component={AdminSupport} />
      <Route path="/admin-api-settings" component={AdminApiSettings} />
      <Route path="/admin-providers" component={AdminProviders} />
      <Route path="/admin-provider-services" component={AdminProviderServices} />
      <Route path="/admin-manual-import" component={AdminManualImport} />

      <Route path="/admin-payment-methods" component={AdminPaymentMethods} />
      <Route path="/admin-payments" component={AdminPayments} />
      <Route path="/admin-support-contacts" component={AdminSupportContacts} />
      <Route path="/admin-support-tickets" component={AdminSupportTickets} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/user-messages" component={AdminUserMessages} />
      <Route path="/admin-whatsapp-chat" component={AdminWhatsAppChat} />
      <Route path="/admin-orders" component={AdminOrders} />
      <Route path="/support-tickets" component={SupportTickets} />
      <Route path="/user-admin-messages" component={UserAdminMessages} />
      <Route path="/messages-with-admin" component={MessagesWithAdmin} />
      <Route path="/admin/referral-settings" component={AdminReferralSettings} />
      <Route path="/admin/logo-settings" component={AdminLogoSettings} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin-service-visibility" component={AdminServiceVisibility} />
      <Route path="/admin-service-management" component={AdminServiceManagement} />
      <Route path="/services" component={ServicesMobile} />
      <Route path="/my-orders" component={MyOrdersEnhanced} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/support" component={Support} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <FloatingSupport />
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
