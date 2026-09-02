import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-paginator',
  imports: [MatButtonModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paginator {
  protected readonly Math = Math;

  readonly pageIndex = input<number>(0);
  readonly totalElements = input<number>(0);
  readonly totalPages = input<number>(0);
  readonly size = input<number>(20);
  readonly pageChange = output<number>();

  protected previous(): void {
    this.pageChange.emit(this.pageIndex() - 1);
  }

  protected next(): void {
    this.pageChange.emit(this.pageIndex() + 1);
  }
}
