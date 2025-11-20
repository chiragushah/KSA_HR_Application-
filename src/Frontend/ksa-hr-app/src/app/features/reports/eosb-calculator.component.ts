import { Component } from '@angular/core';

@Component({
  selector: 'app-eosb-calculator',
  template: `
    <div class="eosb-calculator">
      <h1>EOSB Calculator | حاسبة نهاية الخدمة</h1>

      <div class="card">
        <h3>Calculate End of Service Benefits | حساب مكافأة نهاية الخدمة</h3>
        
        <div class="form-group">
          <label class="form-label">Hire Date | تاريخ التعيين</label>
          <input type="date" class="form-control">
        </div>
        
        <div class="form-group">
          <label class="form-label">End Date | تاريخ الانتهاء</label>
          <input type="date" class="form-control">
        </div>
        
        <div class="form-group">
          <label class="form-label">Last Basic Salary (SAR) | آخر راتب أساسي</label>
          <input type="number" class="form-control">
        </div>
        
        <button class="btn btn-primary">Calculate | احسب</button>

        <div class="result-box" style="margin-top: 2rem; padding: 1.5rem; background-color: rgba(0, 108, 53, 0.05); border-radius: 8px;">
          <h3>Calculation Result | نتيجة الحساب</h3>
          <p><strong>Years of Service | سنوات الخدمة:</strong> 8.5 years</p>
          <p><strong>First 5 Years | أول 5 سنوات:</strong> SAR 25,000</p>
          <p><strong>Remaining Years | السنوات المتبقية:</strong> SAR 35,000</p>
          <p style="font-size: 1.5rem; color: var(--primary-color); margin-top: 1rem;">
            <strong>Total EOSB | المجموع الكلي: SAR 60,000</strong>
          </p>
        </div>
      </div>
    </div>
  `
})
export class EosbCalculatorComponent { }
