import { Component } from '@angular/core';

@Component({
  selector: 'app-leave-management',
  template: `
    <div class="leave-management">
      <h1>Leave Management | إدارة الإجازات</h1>

      <div class="card">
        <h3>Leave Balance | رصيد الإجازات</h3>
        <div class="grid grid-cols-3">
          <div>
            <p><strong>Annual Leave | الإجازة السنوية:</strong> 21 days</p>
          </div>
          <div>
            <p><strong>Sick Leave | الإجازة المرضية:</strong> 120 days</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Request New Leave | طلب إجازة جديدة</h3>
        <button class="btn btn-primary">New Leave Request | طلب إجازة</button>
      </div>
    </div>
  `
})
export class LeaveManagementComponent { }
