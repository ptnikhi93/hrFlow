import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  roles?: string[]; // if omitted, everyone can see it
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);
  private role: string = this.authService.getUser()?.role;
  
 private allItems: NavItem[] =  [
    { label: 'Dashboard', icon: 'fa-house', link: '/dashboard' },
    { label: 'Employees', icon: 'fa-user-group', link: '/employees', roles: ['admin', 'hr'] },
    { label: 'Attendance', icon: 'fa-clock', link: '/attendance', roles: ['hr', 'employee'] },
    { label: 'Leave', icon: 'fa-calendar-days', link: '/leave' },
    { label: 'Holiday Calendar', icon: 'fa-wand-sparkles', link: '/holidays' },
    { label: 'Projects', icon: 'fa-folder', link: '/projects' },
    { label: 'Tickets', icon: 'fa-ticket-simple', link: '/tickets' },
    { label: 'Reports', icon: 'fa-chart-column', link: '/reports' , roles: ['admin', 'hr']},
    { label: 'My Profile', icon: 'fa-user', link: '/profile', roles: ['hr', 'employee'] },
  ];

   navItems = this.allItems.filter(
    (item) => !item.roles || item.roles.includes(this.role)
  );
}
