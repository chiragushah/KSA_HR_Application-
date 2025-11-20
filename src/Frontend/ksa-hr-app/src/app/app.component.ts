import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header></app-header>
      <div class="main-layout">
        <app-sidebar></app-sidebar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      background-color: var(--background);
    }

    @media (max-width: 768px) {
      .content {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'KSA HR Management System';

  ngOnInit(): void {
    // Initialize application
    console.log('KSA HR Application Started');
  }
}
