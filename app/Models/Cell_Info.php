<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cell_Info extends Model
{
    protected $table = 'cells_info';
    protected $primaryKey = 'primary_id';
    protected $fillable = [
        'cell_id',
        'shipping_line',
        'size',
        'type',
        'cell_status',
    ];
    
    public function cell()
    {
        return $this->belongsTo(Cell::class, 'cell_id', 'cell_id');
    }
}
