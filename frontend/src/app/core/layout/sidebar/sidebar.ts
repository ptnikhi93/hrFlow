import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  navItems = [
    { label: 'Dashboard', icon: 'fa-house', link: '/dashboard' },
    { label: 'Employees', icon: 'fa-user-group', link: '/employees' },
    { label: 'Attendance', icon: 'fa-clock', link: '/attendance' },
    { label: 'Leave', icon: 'fa-calendar-days', link: '/leave' },
    { label: 'Holiday Calendar', icon: 'fa-wand-sparkles', link: '/holidays' },
    { label: 'Projects', icon: 'fa-folder', link: '/projects' },
    { label: 'Tickets', icon: 'fa-ticket-simple', link: '/tickets' },
    { label: 'Reports', icon: 'fa-chart-column', link: '/reports' },
  ];
}
