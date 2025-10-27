# 🛡️ RBAC Guards - Ejemplos de Uso

Basados en `RBAC.schema.v7.yml` - Sistema completo de protección de UI.

## 📋 **Principios de Implementación**

✅ **Frontend NO tiene lógica de seguridad**  
✅ **Guards solo ocultan/muestran UI** (UX convenience)  
✅ **Backend siempre valida permisos** (Security enforcement)  
✅ **Basado en roles y permisos del schema v7**

---

## 🔐 **AuthGuard - Autenticación Base**

Protege rutas que requieren login:

```tsx
import { AuthGuard } from "@/features/rbac";

export default function DashboardPage() {
  return (
    <AuthGuard redirectTo="/login">
      <DashboardContent />
    </AuthGuard>
  );
}
```

---

## 👥 **RoleGuard - Protección por Roles**

### Uso Básico:

```tsx
import { RoleGuard, Role } from '@/features/rbac';

// Solo Admins
<RoleGuard roles={Role.ADMIN}>
  <AdminPanel />
</RoleGuard>

// Admin O Project Manager
<RoleGuard roles={[Role.ADMIN, Role.PROJECT_MANAGER]} requireAll={false}>
  <ProjectManagement />
</RoleGuard>

// Debe ser Admin Y Finance Manager (poco común)
<RoleGuard roles={[Role.ADMIN, Role.FINANCE_MANAGER]} requireAll={true}>
  <SuperRestrictedArea />
</RoleGuard>
```

### Guards de Conveniencia:

```tsx
import {
  AdminGuard,
  ProjectManagerGuard,
  FinanceManagerGuard,
  WorkerGuard
} from '@/features/rbac';

// Solo Admins
<AdminGuard>
  <UserManagement />
</AdminGuard>

// Admin O Project Manager
<ProjectManagerGuard>
  <ProjectDashboard />
</ProjectManagerGuard>

// Admin O Finance Manager
<FinanceManagerGuard>
  <FinancialReports />
</FinanceManagerGuard>

// Admin, PM, o Worker
<WorkerGuard>
  <TaskList />
</WorkerGuard>
```

---

## 🔑 **PermissionGuard - Protección Granular**

### Basado en Schema v7:

```tsx
import { PermissionGuard } from '@/features/rbac';

// Crear usuarios
<PermissionGuard permission="User.create">
  <CreateUserButton />
</PermissionGuard>

// Leer proyectos
<PermissionGuard permission="Project.read">
  <ProjectList />
</PermissionGuard>

// Aprobar pagos
<PermissionGuard permission="Payment.approve">
  <PaymentApprovalButton />
</PermissionGuard>

// Múltiples permisos (ANY)
<PermissionGuard
  permission={["Project.read", "Task.read"]}
  requireAll={false}
>
  <ProjectTaskView />
</PermissionGuard>

// Múltiples permisos (ALL)
<PermissionGuard
  permission={["Invoice.create", "Invoice.send"]}
  requireAll={true}
>
  <CreateAndSendInvoiceButton />
</PermissionGuard>
```

### Guards de Dominio:

```tsx
import {
  CreateUserGuard,
  ManageProjectsGuard,
  AssignTasksGuard,
  ApprovePaymentGuard,
  ManageTenantGuard
} from '@/features/rbac';

<CreateUserGuard>
  <AddUserForm />
</CreateUserGuard>

<ManageProjectsGuard>
  <ProjectManagement />
</ManageProjectsGuard>

<AssignTasksGuard>
  <TaskAssignmentModal />
</AssignTasksGuard>

<ApprovePaymentGuard>
  <PaymentApprovalWorkflow />
</ApprovePaymentGuard>

<ManageTenantGuard>
  <TenantSettings />
</ManageTenantGuard>
```

---

## 🧩 **Combinando Guards**

```tsx
// Múltiples niveles de protección
<AuthGuard>
  <RoleGuard roles={[Role.ADMIN, Role.PROJECT_MANAGER]}>
    <PermissionGuard permission="Project.create">
      <CreateProjectButton />
    </PermissionGuard>
  </RoleGuard>
</AuthGuard>

// Con fallback personalizado
<AdminGuard
  fallback={<div>Solo administradores pueden acceder</div>}
>
  <AdminDashboard />
</AdminGuard>

// Con redirección personalizada
<FinanceManagerGuard redirectTo="/access-denied">
  <FinancialControls />
</FinanceManagerGuard>
```

---

## 🎯 **Casos de Uso por Dominio**

### **Tenant Management:**

```tsx
<PermissionGuard permission="Tenant.update">
  <TenantSettingsForm />
</PermissionGuard>

<PermissionGuard permission="TenantSettings.update">
  <FeatureFlagsPanel />
</PermissionGuard>
```

### **User & Member Management:**

```tsx
<PermissionGuard permission="User.create">
  <InviteUserButton />
</PermissionGuard>

<PermissionGuard permission="Member.assign">
  <AssignMemberToProjectButton />
</PermissionGuard>
```

### **Project Management:**

```tsx
<PermissionGuard permission="Project.create">
  <NewProjectButton />
</PermissionGuard>

<PermissionGuard permission="Task.assign">
  <TaskAssignmentDropdown />
</PermissionGuard>

<PermissionGuard permission="ChangeOrder.approve">
  <ApproveChangeOrderButton />
</PermissionGuard>
```

### **Financial Operations:**

```tsx
<PermissionGuard permission="Invoice.create">
  <CreateInvoiceButton />
</PermissionGuard>

<PermissionGuard permission="Payment.approve">
  <PaymentApprovalQueue />
</PermissionGuard>

<PermissionGuard permission="Expense.approve">
  <ExpenseApprovalWorkflow />
</PermissionGuard>
```

### **Time & Scheduling:**

```tsx
<PermissionGuard permission="TimeOffRequest.approve">
  <ApproveTimeOffButton />
</PermissionGuard>

<PermissionGuard permission="Schedule.create">
  <CreateScheduleForm />
</PermissionGuard>
```

---

## 🔧 **Hooks para Lógica Condicional**

```tsx
import {
  useRbac,
  useAdminAccess,
  useProjectManagerAccess,
} from "@/features/rbac";

function MyComponent() {
  const { hasRole, hasPermission, isAdmin } = useRbac();
  const { canManageUsers } = useAdminAccess();
  const { canCreateProjects } = useProjectManagerAccess();

  return (
    <div>
      {hasRole(Role.ADMIN) && <AdminMenu />}

      {hasPermission("User.create") && <CreateUserButton />}

      {isAdmin() && <SystemSettings />}

      {canManageUsers && <UserManagement />}

      {canCreateProjects && <ProjectCreation />}
    </div>
  );
}
```

---

## ⚠️ **Consideraciones Importantes**

### **1. Seguridad Real en Backend:**

```tsx
// ❌ MAL - Confiando solo en frontend
if (hasPermission("User.delete")) {
  await deleteUser(userId); // Backend debe validar también
}

// ✅ BIEN - Frontend + Backend
{
  hasPermission("User.delete") && (
    <DeleteUserButton
      onClick={() => deleteUser(userId)} // Backend valida permisos
    />
  );
}
```

### **2. Fallbacks Informativos:**

```tsx
<PermissionGuard
  permission="Project.create"
  fallback={
    <div className="text-gray-500">
      Necesitas permisos de Project Manager para crear proyectos. Contacta tu
      administrador.
    </div>
  }
>
  <CreateProjectForm />
</PermissionGuard>
```

### **3. Loading States:**

```tsx
function ProtectedComponent() {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminGuard>
      <AdminPanel />
    </AdminGuard>
  );
}
```

---

## 🚀 **Next Steps**

1. ✅ **Guards implementados** basados en RBAC.schema.v7.yml
2. ✅ **Hooks disponibles** para lógica condicional
3. ✅ **Servicios preparados** para API integration
4. 🔄 **Pendiente**: Integrar con backend `/api/rbac/*` endpoints
5. 🔄 **Pendiente**: Testing con usuarios reales y permisos

**¡El sistema RBAC frontend está listo para usar!** 🎉
