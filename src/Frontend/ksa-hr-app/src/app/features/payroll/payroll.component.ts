import { Component } from '@angular/core';

@Component({
  selector: 'app-payroll',
  template: `
    <div class="payroll">
      <h1>Payroll Processing | معالجة الرواتب</h1>

      <div class="card">
        <h3>Process Monthly Payroll | معالجة الرواتب الشهرية</h3>
        <p>Select month and year to process payroll with GOSI contributions.</p>
        
        <div class="form-group">
          <label class="form-label">Month | الشهر</label>
          <select class="form-control">
            <option value="1">January | يناير</option>
            <option value="2">February | فبراير</option>
            <option value="3">March | مارس</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Year | السنة</label>
          <input type="number" class="form-control" value="2025">
        </div>
        
        <button class="btn btn-primary">Process Payroll | معالجة الرواتب</button>
      </div>
    </div>
  `
})
export class PayrollComponent { }
