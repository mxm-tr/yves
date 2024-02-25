import { type NextRequest } from 'next/server'
import { deleteAppointment } from '@/app/lib/actions';


export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
  ) {
  
    console.log(params)
    const id = params.slug
    await deleteAppointment(id);
  
    return new Response('Appointment cancelled', {
      status: 200,
    })
  }
  