import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Users, 
  Monitor, 
  MoreVertical, 
  Edit, 
  Trash2,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Lab } from '@/types/lab';
import { mockStudents } from '@/data/mockStudents';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const LAB_COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
];

const initialLabs: Lab[] = [
  {
    id: '1',
    name: 'CS101 - Intro to Programming',
    description: 'Monday/Wednesday morning sessions',
    room: 'Lab Room A',
    capacity: 30,
    studentIds: ['1', '2', '3', '4', '5', '6', '7', '8'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'CS201 - Data Structures',
    description: 'Tuesday/Thursday afternoon sessions',
    room: 'Lab Room B',
    capacity: 25,
    studentIds: ['9', '10', '11', '12', '13'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isActive: true,
    color: 'bg-purple-500'
  },
  {
    id: '3',
    name: 'CS301 - Web Development',
    description: 'Friday project lab',
    room: 'Lab Room A',
    capacity: 20,
    studentIds: ['14', '15', '16', '17'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isActive: false,
    color: 'bg-green-500'
  },
];

export default function LabManagement() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room: '',
    capacity: 30,
    color: 'bg-blue-500',
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const availableStudents = mockStudents.filter(
    s => !labs.some(lab => lab.id !== editingLab?.id && lab.studentIds.includes(s.id))
  );

  const handleCreateLab = () => {
    if (!formData.name.trim() || !formData.room.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in the required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newLab: Lab = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      room: formData.room,
      capacity: formData.capacity,
      studentIds: selectedStudents,
      createdAt: new Date(),
      isActive: false,
      color: formData.color,
    };

    setLabs(prev => [...prev, newLab]);
    resetForm();
    setIsCreateOpen(false);
    toast({ title: 'Lab created successfully!' });
  };

  const handleUpdateLab = () => {
    if (!editingLab) return;

    setLabs(prev => prev.map(lab => 
      lab.id === editingLab.id
        ? {
            ...lab,
            name: formData.name,
            description: formData.description,
            room: formData.room,
            capacity: formData.capacity,
            color: formData.color,
            studentIds: selectedStudents,
          }
        : lab
    ));

    resetForm();
    setEditingLab(null);
    toast({ title: 'Lab updated successfully!' });
  };

  const handleDeleteLab = (labId: string) => {
    setLabs(prev => prev.filter(lab => lab.id !== labId));
    toast({ title: 'Lab deleted', variant: 'destructive' });
  };

  const toggleLabActive = (labId: string) => {
    setLabs(prev => prev.map(lab => 
      lab.id === labId ? { ...lab, isActive: !lab.isActive } : lab
    ));
  };

  const openEditDialog = (lab: Lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      description: lab.description,
      room: lab.room,
      capacity: lab.capacity,
      color: lab.color,
    });
    setSelectedStudents(lab.studentIds);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      room: '',
      capacity: 30,
      color: 'bg-blue-500',
    });
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const LabFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium mb-2 block">Lab Name *</label>
          <Input
            placeholder="e.g., CS101 - Intro to Programming"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Room *</label>
          <Input
            placeholder="e.g., Lab Room A"
            value={formData.room}
            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Capacity</label>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Add notes about this lab..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium mb-2 block">Color</label>
          <div className="flex gap-2">
            {LAB_COLORS.map(color => (
              <button
                key={color.value}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  color.value,
                  formData.color === color.value && "ring-2 ring-offset-2 ring-primary"
                )}
                onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Assign Students ({selectedStudents.length} selected)
        </label>
        <ScrollArea className="h-48 border rounded-lg p-2">
          <div className="space-y-1">
            {availableStudents.map(student => (
              <div
                key={student.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                  selectedStudents.includes(student.id)
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary"
                )}
                onClick={() => toggleStudentSelection(student.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.workstation}</p>
                  </div>
                </div>
                {selectedStudents.includes(student.id) && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <TeacherSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border px-4 lg:px-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Lab Management</h1>
            <p className="text-xs text-muted-foreground">Create and manage lab groups</p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Labs
                </CardTitle>
                <Building className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{labs.length}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Labs
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">
                  {labs.filter(l => l.isActive).length}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {labs.reduce((acc, lab) => acc + lab.studentIds.length, 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Capacity
                </CardTitle>
                <Monitor className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {labs.reduce((acc, lab) => acc + lab.capacity, 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Create Lab Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Your Labs</h2>
              <p className="text-sm text-muted-foreground">
                Manage student groups and lab sessions
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="btn-glow" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lab
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Lab</DialogTitle>
                  <DialogDescription>
                    Set up a new lab group with assigned students.
                  </DialogDescription>
                </DialogHeader>
                <LabFormContent />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLab}>Create Lab</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Labs Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {labs.map(lab => (
              <Card key={lab.id} className="glass-card overflow-hidden">
                <div className={cn("h-2", lab.color)} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{lab.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building className="w-3 h-3" />
                        {lab.room}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(lab)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Lab
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleLabActive(lab.id)}>
                          {lab.isActive ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteLab(lab.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Lab
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {lab.description && (
                    <p className="text-sm text-muted-foreground mb-4">{lab.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {lab.studentIds.length} / {lab.capacity} students
                      </span>
                    </div>
                    <Badge variant={lab.isActive ? "default" : "secondary"}>
                      {lab.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Created {format(lab.createdAt, 'MMM d, yyyy')}
                  </div>

                  {/* Student Avatars */}
                  <div className="flex items-center gap-1 mt-4">
                    {lab.studentIds.slice(0, 5).map(studentId => {
                      const student = mockStudents.find(s => s.id === studentId);
                      return student ? (
                        <div
                          key={studentId}
                          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium border-2 border-background -ml-2 first:ml-0"
                          title={student.name}
                        >
                          {student.name.charAt(0)}
                        </div>
                      ) : null;
                    })}
                    {lab.studentIds.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium border-2 border-background -ml-2">
                        +{lab.studentIds.length - 5}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {labs.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No labs created yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first lab to start managing student groups.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Lab
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLab} onOpenChange={(open) => !open && setEditingLab(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Lab</DialogTitle>
            <DialogDescription>
              Update lab details and student assignments.
            </DialogDescription>
          </DialogHeader>
          <LabFormContent isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLab(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLab}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
